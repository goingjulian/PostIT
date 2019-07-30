import React from 'react';

import MultiInput from './AllowedMailDomainsInput';
import Input from './Input';
import EmailInput from './EmailInput';
import ImageUpload from './ImageUpload';
import VerifiedInput from './VerifiedInput';

export default function Form(props) {
    return (
        <>
            {
                Object.keys(props.regFields).map((key, index) => {
                    const field = props.regFields[key];
                    const inputProps = { fieldName: key, key: key, field: field, setValueAction: props.setValueAction };
                    switch (props.regFields[key].type) {
                        case 'verified-input':
                            return <VerifiedInput {...inputProps} />
                        case 'multi-input':
                            return <MultiInput {...inputProps} />
                        case 'email-input':
                            return <EmailInput {...inputProps} />
                        case 'img-upload':
                            return <ImageUpload {...inputProps}/>
                        default:
                            return <Input {...inputProps} />
                    }
                })
            }
        </>
    );
}