
import 'react-quill/dist/quill.snow.css';
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";
import uploadImage from '../helper/Uploadimage'

export default function CreatePost() {
  const [data, setData] = useState({
    title: "",
    summary: "",
    content: "",
    Image: ""
  });

  const [redirect, setRedirect] = useState(false)

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    const uploadImageCloudinary = await uploadImage(file);
  
    setData((prev) => ({
      ...prev,
      Image: uploadImageCloudinary.url
    }));
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (value) => {
    setData(prev => ({
      ...prev,
      content: value,
    }));
  };
  
  async function createNewPost(ev) {
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }
  return (
    <form onSubmit={createNewPost}>
       <input
        type="file"
        onChange={handleUploadImage}
      />
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={data.title}
        onChange={handleChange}
      />
      <input
        type="text"
        name="summary"
        placeholder="Summary"
        value={data.summary}
        onChange={handleChange}
      />
      <Editor value={data.content} onChange={handleEditorChange} />
      <button style={{ marginTop: '5px' }}>Create post</button>
    </form>
  );
}
