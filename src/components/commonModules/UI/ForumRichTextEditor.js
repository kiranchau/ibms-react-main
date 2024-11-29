/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useEffect, useRef } from 'react';
import 'quill-mention';
import { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ onChange, mentionOnChange, initialValue, taggingList, cleartext }) => {
  const textEditorRef = useRef(null);
  const quillRef = useRef(null);
  const initializeQuill = () => {
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
          mentionDenotationChars: ['@'],
          source: function (searchTerm, renderList, mentionChar) {
            let values;

            if (mentionChar === '@') {
              values = taggingList;
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
        }
      },
      theme: 'snow',
    });
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
  };

  useEffect(() => {
    if (taggingList.length > 0) {
      initializeQuill();
    }
  }, [taggingList]);

  useEffect(() => {
    if (cleartext == "clear") {
      quillRef.current.root.innerHTML = ""
    }
  }, [cleartext]);

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.on('text-change', (delta, oldContent, source) => {
        const content = quillRef.current.getContents();
        const mentions = [];
        onChange(quillRef.current.root.innerHTML)
        content.ops.forEach(op => {
          if (op.insert && typeof op.insert === 'object' && op.insert.mention) {
            // Extract mention information
            const mentionInfo = op.insert.mention;
            mentions.push({
              id: mentionInfo.id, // Assuming your mention object has an ID
              value: mentionInfo.value // Assuming your mention object has a value
            });
          }
        });
        mentionOnChange(mentions)
      });
    }
  }, [quillRef.current]);

  useEffect(() => {
    if (quillRef.current) {
      if (initialValue) {
        quillRef.current.root.innerHTML = initialValue
      } else {
        quillRef.current.root.innerHTML = ""
      }
    }
  }, [initialValue, quillRef])

  return (
    <div className='quill-editor-custom-wrapper'>
      <div ref={textEditorRef} style={{ height: '180px' }}></div>
    </div>
  );
};

export default RichTextEditor;
