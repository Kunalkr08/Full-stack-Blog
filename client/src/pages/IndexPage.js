import React, { useEffect, useState } from 'react'
import Post from '../Post'
import Loading from '../Loading'


export default function IndexPage() {

  const [posts, setPosts] =  useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(()=>{
      fetch('https://full-stack-blog-roan.vercel.app/post').then(response=>{
          response.json().then(posts => {
              setPosts(posts);
              setLoading(false);
          });
      })
  },[])
  
  if (loading) {
    return <Loading />;
  }
  
  return (
     <>
       {posts.length > 0 && posts.map(post => (
        <Post {...post} />
      ))}
     </>
  )
}
