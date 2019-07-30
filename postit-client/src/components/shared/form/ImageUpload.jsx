import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BeatLoader } from 'react-spinners';

import { CONN_URL, MAX_IMAGE_SIZE } from '../../..//index';

export default function ImageUpload(props) {
    const [fileRejected, setFileRejected] = useState(false);
    let timeout;

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop: files => {
            if (files.length > 0) {
                setFileRejected(false);
                clearInterval(timeout);
                props.field.setImgUploading(props.fieldName);
                props.field.uploadImage(props.fieldName, files[0]);
            }
        },
        onDropRejected: () => {
            setFileRejected(true);
            timeout = setTimeout(() => setFileRejected(false), 8000);
        },
        disabled: props.field.uploading,
        multiple: false,
        accept: "image/png, image/jpeg, image/gif",
        maxSize: MAX_IMAGE_SIZE
    });

    let feedbackClass = '';
    if ((isDragActive && !isDragReject)) feedbackClass = 'dragActive';
    else if (isDragReject || fileRejected) feedbackClass = 'dragReject';
    else if (props.field.uploading) feedbackClass = 'dragWait';
    else if (props.field.value) feedbackClass = 'dragValid';

    let element = <UploadInput getInputProps={getInputProps} isDragActive={isDragActive} isDragReject={isDragReject} fileRejected={fileRejected} imageURL={props.field.value} />;
    if (props.field.uploading) element = <WaitForUpload />;

    return <div className={`box dropzone ${feedbackClass}`} {...getRootProps()}>
        <i className="fas fa-image" />
        <h3 className="title is-5">{props.field.displayText}</h3>
        {element}
    </div>
}

function UploadInput(props) {
    let text;

    if (props.imageURL && !props.isDragActive && !props.isDragReject && !props.fileRejected) text = <p className="subtitle">Image saved!</p>;
    else if (props.isDragReject) text = <p className="subtitle">This file format is not allowed (only .png and .jpg)</p>;
    else if (props.isDragActive) text = <p className="subtitle">Drop the file here</p>;
    else if (props.fileRejected) text = <p className="subtitle">The file was rejected, the file is probably too big or not of the right format</p>;
    else text = <p className="subtitle">Drop a file here to upload it, or <span className="fakeURL">click</span> to select one</p>;

    return <div className="upload">
        <input {...props.getInputProps()} />
        {props.imageURL ?
            <img src={
                typeof props.imageURL === 'object' ? URL.createObjectURL(props.imageURL)
                : `${CONN_URL}/img/${props.imageURL}?nocache=${new Date().getTime()}`} alt={props.displayText} />
            : null}
        {text}
        <button className="button is-info">{props.imageURL ? 'Change image' : 'Upload image'}</button>
    </div>
}

function WaitForUpload(props) {
    return <>
        <BeatLoader size={12} color={'#FFFFFF'} />
        <p className="subtitle">Uploading image...</p>
    </>
}