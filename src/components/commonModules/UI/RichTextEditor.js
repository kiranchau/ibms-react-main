/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useEffect, useState, useRef, useContext } from 'react';
import 'quill-mention';
import { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from 'antd';
import { separateAndTransformIds, uniqueArray } from '../../../Utils/helpers';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { GlobalSearch } from '../../contexts/GlobalSearchContext';
const regex = /<p>\s+<\/p>/

const RichTextEditor = (props) => {
  const [value, setValue] = useState('');
  const [userTags, setUserTags] = useState([]);
  const quillRef = useRef(null);
  const textEditorRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState({ note: "" })
  const { mentionArr } = useContext(GlobalSearch)

  useEffect(() => {
    setFormError({ note: "" })
  }, []);

  useEffect(() => {
    if (mentionArr?.length > 0) {
      quillRef.current = new Quill(textEditorRef.current, {
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
          ],
          mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ['@', '#'],
            source: function (searchTerm, renderList, mentionChar) {
              let values;

              if (mentionChar === '@') {
                values = mentionArr;
              }

              if (searchTerm.length === 0) {
                renderList(values, searchTerm);
              } else {
                const matches = values.filter((mention) =>
                  mention?.value?.toLowerCase().includes(searchTerm?.toLowerCase())
                );
                renderList(matches, searchTerm);
              }
            },
          },
        },
        theme: 'snow',
      });
      if (props.editValue) {
        quillRef.current.root.innerHTML = props.editValue
      }
      // Override the default image handler
      quillRef.current.getModule('toolbar').addHandler('image', function () {
        let input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        // Listen for the file input change event
        input.onchange = function () {
          let file = input.files[0];
          let fileSize = file.size / 1024; // Convert bytes to KB
          if (fileSize > 45) {
            alert("Image size is too large. It should be lesser than 45KB.");
            return;
          }

          // Use FileReader to read file as Data URL
          let reader = new FileReader();
          reader.onload = function () {
            let range = quillRef.current.getSelection(true);
            quillRef.current.insertEmbed(range.index, 'image', reader.result);
          };
          reader.readAsDataURL(file);
        };
      });
      quillRef.current.on('text-change', (delta, oldContent, source, mentionChar) => {
        setFormError({ note: "" })
        setValue(quillRef.current.root.innerHTML)
        const content = quillRef.current.getContents();
        const mentions = [];
        content.ops.forEach(op => {
          if (op.insert && typeof op.insert === 'object' && op.insert.mention) {
            const mentionInfo = op.insert.mention;
            mentions.push({
              id: mentionInfo.id,
              value: mentionInfo.value
            });
          }
        });
        setUserTags(mentions)
      })
    }
  }, [mentionArr, props.editValue]);

  const handleSave = async () => {
    let ids = userTags ? userTags.map(m => m.id) : []
    const { userIds, deptIds } = separateAndTransformIds(ids)

    if (value == "" || value == "<p><br></p>" || regex.test(value)) {
      setFormError({ note: "Please enter note" })
      return
    }

    const dataToSend = {
      task_id: props.selectedTask?.id ? props.selectedTask?.id : null,
      job_id: props.selectedJob?.id ? props.selectedJob?.id : null,
      note: value,
      dept_ids: uniqueArray(deptIds),
      user_ids: uniqueArray(userIds),
    };
    setIsSaving(true)
    props.saveButtonHandler(props.selectedTask?.id, dataToSend, props.commentSelectedForEdit, props.selectedJob?.id).then(() => {
      if (!props.editValue) {
        quillRef.current.root.innerHTML = ""
        setUserTags([])
      }
    }).finally(() => {
      setIsSaving(false)
    })
  };

  return (
    <div className='quill-editor-custom-wrapper'>
      <div ref={textEditorRef} style={{ height: '180px' }}></div>
      {formError?.note ? <span className='ms-2 text-danger d-block'>{formError?.note}</span> : null}
      <Button type="submit" className='button save-note-btn' onClick={handleSave}>
        {isSaving ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} /> : "Save Note"}
      </Button>
    </div>
  );
};

export default RichTextEditor;
