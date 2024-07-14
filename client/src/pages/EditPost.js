
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";
import uploadImage from '../helper/Uploadimage';

export default function EditPost() {
  const { id } = useParams();
  const [data, setData] = useState({
    id: id, // Initialize id from useParams()
    title: "",
    summary: "",
    content: "",
    Image: ""
  });
  const [redirect, setRedirect] = useState(false);

  // Fetch post data when id changes
  useEffect(() => {
    fetch('http://localhost:4000/post/' + id)
      .then(response => response.json())
      .then(postInfo => {
        setData({
          id : id,
          title: postInfo.title,
          summary: postInfo.summary,
          content: postInfo.content,
          Image: postInfo.cover
        });
      });
  }, [id]); // Ensure useEffect runs when id changes

  // Function to handle file upload
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    const uploadImageCloudinary = await uploadImage(file);

    setData(prev => ({
      ...prev,
      Image: uploadImageCloudinary.url,
    }));
  };

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle editor content changes
  const handleEditorChange = (value) => {
    setData(prev => ({
      ...prev,
      content: value,
    }));
  };


  // Function to update post
  async function updatePost(ev) {
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/post', {
      method: 'PUT',
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

  // Redirect if update was successful
  if (redirect) {
    return <Navigate to={'/'} />;
  }

  // Render form for editing post
  return (
    <form onSubmit={updatePost}>
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
      <button style={{ marginTop: '5px' }}>Update post</button>
    </form>
  );
}
