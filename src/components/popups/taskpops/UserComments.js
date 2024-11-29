import React, { useEffect, useState } from 'react';
import '../../SCSS/popups.scss';
import * as MdIcons from 'react-icons/md';
import Button from '../../commonModules/UI/Button';
import { MdDelete } from 'react-icons/md';
import RichTextEditor from '../../commonModules/UI/RichTextEditor';
import { parseDateTimeString } from '../../../Utils/dateFormat';
import { getUserInitials } from '../../../Utils/helpers';
import { addActivityNotes, deleteActivityNotes, updateActivityNotes } from '../../../API/authCurd';
import NoActivity from "../../../images/no-activity.jpg"
import parse from 'html-react-parser';

const UserComments = (props) => {
    const[mentions, setMentions] = useState('')
    const [toggle, setToggle] = useState(1);
    const [richTextEditorValue, setRichTextEditorValue] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editModeValue, setEditModeValue] = useState("");
    const [commentSelectedForEdit, setCommentSelectedForEdit] = useState(null);
    const [addCommentError, setAddCommentError] = useState("");
    const [editCommentError, setEditCommentError] = useState("");
  
    const [suggestionsDepart, setSuggestionsDepart] = useState([]);
    console.log("[suggestions",suggestionsDepart)

    useEffect(() => {
        console.log("mentions",mentions)
        }, [mentions])
        //   const [suggestions, setSuggestions] = useState([]);
        //   const [suggestionsDepart, setSuggestionsDepart] = useState([]);
        //   const [mentionedUsersList, setMentionedUsersList] = useState([]);
        
        //   useEffect(() => {
        //     // Fetch users when the component mounts
        //     fetchUsers("");
        //     fetchDepartment("")
        //   }, []);
      
      
        // const fetchUsers = async (query) => {
        //   try {
        //     const response = await GetUsers();
        //     const Users = response.data.users;
      
        //     const formattedUsers = Users.map((user) => ({
        //       id: user.id,
        //       display: `@${user.name}`, // Add "@" to the display name
        //     }));
      
        //     setSuggestions(formattedUsers);
        //   } catch (error) {
       
        //   }
        // };
      
        // const fetchDepartment = async (query) => {
        //   try {
        //     const response = await fetchDepartments();
        //     const Departments = response.data.departments;
      
        //     const formattedDepartments = Departments.map((department) => ({
        //       id: department.id,
        //       display: `#${department.name}`, // Use "@" for departments
        //     }));
      
        //     setSuggestionsDepart(formattedDepartments);
        //   } catch (error) {
        //    
        //   }
        // };
      
      //  const submitHandler = () => {
      //   if (!richTextEditorValue || richTextEditorValue === '<p><br></p>') {
      //     setAddCommentError('Please enter note!');
      //     return;
      //   }
      
      //   const mentionedUsers = parseMentions(value);
      //   const mentionedDepartments = parseDepartments(value);
      
      //   const payload = {
      //     note: richTextEditorValue,
      //     mentionedUsers: mentionedUsers.map((user) => user.display),
      //     mentionedDepartments: mentionedDepartments.map((department) => department.display),
      //     hiddenField: 'hidden value'
      //   };
      
      //   addMasterData(payload)
      //     .then((res) => {
      //      
      //       // Further handling of the response if needed
      //     })
      //     .catch((error) => {
      //     
      //       // Handle the error, update state, show an error message, etc.
      //     });
      // };
      const submitHandler = () => {
       
      };
      
      
      
      
      const parseDepartments = (inputValue) => {
        const departments = [];
        const regex = /#(\S+)/g; // Updated regular expression
      
        let match;
        while ((match = regex.exec(inputValue)) !== null) {
          departments.push({ display: match[1] });
        }
      
        return departments;
      };
      
      const parseMentions = (inputValue) => {
        const mentions = [];
        const regex = /@(\S+)/g;
      
        let match;
        while ((match = regex.exec(inputValue)) !== null) {
          const display = match[1];
          if (display) {
            mentions.push({ display });
          }
        }
      
        return mentions;
      };
      
      
        const updateToggle = (id) => {
          setToggle(id);
        };
      
        const richTextEditorSaveBtnHandler = () => {
          if (props.selectedTask) {
            if (!richTextEditorValue || richTextEditorValue === '<p><br></p>' ) {
              setAddCommentError('Please enter note!');
              return;
            }
      
      
            if (!richTextEditorValue || richTextEditorValue === '<p><br></p>') {
              setAddCommentError('Please enter note!');
              return;
            }
          
            const mentionedUsers = parseMentions(mentions);
            // const mentionedDepartments = parseDepartments(richTextEditorValue);
          console.log("suggestions Submit", mentionedUsers )
            const payload = {
              task_id: props.selectedTask.id,
              note: richTextEditorValue,
              mentionedUsers: mentionedUsers.map((user) => user.display),
              // mentionedDepartments: mentionedDepartments.map((department) => department.display),
            };
      
            console.log(" mentionedUsers", mentionedUsers)
      
            
      
            addActivityNotes(payload)
              .then(() => {
                props.getActivityNotesByTaskId(props.selectedTask.id);
                setRichTextEditorValue('');
              })
              .catch((error) => {
                console.error('addActivityNotes:error ', error);
              });
          }
        };
      
        const onDeleteBtnClick = (e, comment) => {
          e.preventDefault();
          deleteActivityNotes(comment.id)
            .then(() => {
              const updatedActivityNotes = props.activityNotes.filter((item) => item.id !== comment.id);
              props.setActivityNotes(updatedActivityNotes);
            })
            .catch((error) => {
              console.error('Error deleting note', error);
            });
        };
      
        const richTextEditorOnChangeHandler = (value) => {
          setAddCommentError('');
          setRichTextEditorValue(value);
        };
      
        const onEditBtnClick = (e, comment) => {
          e.preventDefault();
          setIsEditMode(true);
          setCommentSelectedForEdit(comment);
          setEditModeValue(comment.note);
        };
      
        const editModeOnChangeHandler = (value) => {
          setEditCommentError('');
          setEditModeValue(value);
        };
      
        const editModeSaveBtnHandler = () => {
          if (props.selectedTask) {
            if (!editModeValue || editModeValue === '<p><br></p>') {
              setEditCommentError('Please enter note!');
              return;
            }
      
            const payload = {
              task_id: props.selectedTask.id,
              note: editModeValue,
            };
      
            updateActivityNotes(commentSelectedForEdit.id, payload)
              .then(() => {
                props.getActivityNotesByTaskId(props.selectedTask.id);
                setEditModeValue('');
                setIsEditMode(false);
                setCommentSelectedForEdit(null);
                props.getActivityNotesByTaskId(props.selectedTask.id);
              })
              .catch((error) => {
                console.error('updateActivityNotes:error ', error);
              });
          }
        };
      
        const closeBtnHandler = () => {
          props.onClick();
          setIsEditMode(false);
        };

        
  return (
    <div className={toggle === 1 ? 'comments-content align-start flex-column' : 'hide-content'}>
    {props.activityNotes ? (
      props.activityNotes.map((item) => (
        <div key={item.id} className='d-flex pb-3'>
          <div className='initial-text pe-3'>
            <span>{getUserInitials(item.created_by_user.first_name,item.created_by_user.last_name )}</span>


          </div>
          <div>
            <div className='user-details'>
              <p className='user-name'>{`${item.created_by_user.first_name} ${item.created_by_user.last_name}` }</p>

              <p className='date-time'>created the Issue {parseDateTimeString(item.created_at, 1)}</p>
            </div>
            {commentSelectedForEdit?.id === item?.id && isEditMode ? (
              <div className='text-editor position-relative'>
                
                  <RichTextEditor value={editModeValue} onChange={editModeOnChangeHandler} richTextEditorSaveBtnHandler={richTextEditorSaveBtnHandler}/>
                  {editCommentError && <p className='text-danger fst-italic mb-2'>{editCommentError}</p>}
                
                <Button type='submit' onClick={editModeSaveBtnHandler}>
                  Save Note
                </Button>
              </div>
            ) : (
              <p className='comment'>{parse(item.note)}</p>
            )}
            <div className='comment-action'>
              <a href='' onClick={(e) => onEditBtnClick(e, item)}>
                Edit
              </a>
              <a href=''>Reply All</a>
              <a href=''>@All Users</a>
              <a href='' onClick={(e) => onDeleteBtnClick(e, item)}>
                <MdDelete />
              </a>
            </div>
          </div>
        </div>
      ))
    ) : (
     <div className='no-activity'>
        <img src={NoActivity}/>
       <h5>No Activities</h5>
     </div>
    )}
  </div>
  );
}

export default UserComments;
