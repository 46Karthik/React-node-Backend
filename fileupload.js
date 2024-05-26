import React from "react";
import { useState } from "react";
import assets from "../src/asset/assets.gif";
import axios from "axios";

export default function UploadImage() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
    //   console.log(fileReader,'sss')
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  async function uploadSinglefile(event) {
    const files = event.target.files;
    const formData = new FormData();
    formData.append('file', files[0]);
    setLoading(true);
    
    try {
        const res = await axios.post("http://localhost:5000/uploadfile", formData);
        
        alert("file uploaded Succesfully");
    } catch (error) {
        console.error('Error uploading image:', error);
        // Handle error appropriately
    } finally {
        setLoading(false);
    }
}

  

//   const uploadfile = async (event) => {
//     const files = event.target.files;
    

//     if (files.length === 1) {
//       const base64 = await convertBase64(files[0]);
//       uploadSinglefile(base64,files[0].name,files[0].size,files[0].type);
//       return;
//     }

    
//   };

  function UploadInput() {
    return (
      <div class="flex items-center justify-center w-full">
        <label
          for="dropzone-file"
          class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              aria-hidden="true"
              class="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span class="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
             Text file
            </p>
          </div>
          <input
            onChange={uploadSinglefile}
            id="dropzone-file"
            type="file"
            class="hidden"
            multiple
          />
        </label>
      </div>
    );
  }

  return (
    <div className="flex justify-center flex-col m-8 ">
      <div>
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">
          Upload file
        </h2>
      </div>
      <div>
        {url && (
          <div>
            Access you file at{" "}
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          </div>
        )}
      </div>
      <div>
        {loading ? (
          <div className="flex items-center justify-center">
            <img src={assets} />{" "}
          </div>
        ) : (
          <UploadInput />
        )}
      </div>
    </div>
  );
}