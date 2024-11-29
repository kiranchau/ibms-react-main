// YourComponent.js
import React, { useState, useEffect } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import axios from 'axios';
import ReactQuill from 'react-quill';
import { sendDataToBackendNewApi } from '../../../API/authCurd';


const RichText = () => {
  const [apiData, setApiData] = useState([]);
  const [backendResponse, setBackendResponse] = useState(null);
  const [mentionData, setMentionData] = useState([]);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    // Fetch data from the API
    axios.get('https://jsonplaceholder.typicode.com/users')
      .then((response) => {
        const users = response.data.map((user) => ({
          id: user.id,
          display: user.name,
          // Add other properties you want to use for mentions
        }));
        setApiData(users);
        setMentionData(users);
      })
      .catch((error) => {
        console.error('Error fetching data from API:', error);
      });
  }, []);

  // const sendDataToBackend = () => {
  //   const dataToSend = {
  //     content: editorContent,
  //     // Add other relevant data
  //   };
  
  //   console.log("dataToSend", dataToSend);
  
  //   sendDataToBackendApi(dataToSend)
  //     .then((res) => {
  //       console.log("Response from backend:", res);
  //       setBackendResponse(res.data);
  //     })
  //     .catch((error) => {
  //       console.error('Error sending data to backend:', error);
  //     });

  //     // sendDataToBackendApi2(dataToSend)
  //     // .then((response) => {
  //     //   console.log("Response from backend (API 2):", response);
  //     //   // Handle the response from the second API if needed
  //     //   // setBackendResponse2(response.data);
  //     // })
  //     // .catch((error) => {
  //     //   console.error('Error sending data to backend (API 2):', error);
  //     // });
  // };
  
// ================
  // const sendDataToBackend = () => {
  //   // Extract mention IDs from the editor content
  //   const mentionIds = [];
  //   const regex = /@\[([^\]]+)\]\((\d+)\)/g; // Regex to match mentions
  //   let match;
  //   while ((match = regex.exec(editorContent)) !== null) {
  //     const [, display, id] = match;
  //     mentionIds.push({ display, id });
  //   }

  //   // Extract only the IDs
  //   const idsToSend = mentionIds.map(({ id }) => id);

  //   // Send only the IDs to the backend
  //   sendDataToBackendApi({ ids: idsToSend })
  //     .then((res) => {
  //       console.log("Response from backend:", res);
  //       setBackendResponse(res.data);
  //     })
  //     .catch((error) => {
  //       console.error('Error sending data to backend:', error);
  //     });
  // };
  // =======================

  const sendDataToBackend = () => {
    // Extract mention information from the editor content
    const mentionInfo = [];
    const regex = /@\[([^\]]+)\]\((\d+)\)/g; // Regex to match mentions
    let match;
    while ((match = regex.exec(editorContent)) !== null) {
      const [, display, id] = match;
      mentionInfo.push({ display, id });
    }

    // Send only the mention information to the backend
    sendDataToBackendNewApi({ mentions: mentionInfo })
      .then((res) => {
        console.log("Response from backend:", res);
        setBackendResponse(res.data);
      })
      .catch((error) => {
        console.error('Error sending data to backend:', error);
      });
  };



  const handleEditorChange = (event) => {
    const value = event.target.value;
    setEditorContent(value);
  };

  const handleSave = () => {
    sendDataToBackend();
  };

  return (
    <div>
      <h1>Rich Text Editor with Mention</h1>
      <ReactQuill />
      <MentionsInput
        value={editorContent}
        onChange={(value, event) => {
          console.log('New value:', value);
          handleEditorChange(value, event);
        }}
        style={{ width: '100%', minHeight: '200px' }}
        markup="@[__display__](__id__)"
        displayTransform={(id, display) => `@${display}`}
        suggestions={mentionData}
      >
        <Mention
          trigger="@"
          data={mentionData}
          displayTransform={(id, display) => `@${display}`}
        />
      </MentionsInput>

      <button onClick={handleSave}>Save Data</button>

      {backendResponse && (
        <div>
          <h2>Backend Response</h2>
          <pre>{JSON.stringify(backendResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default RichText;