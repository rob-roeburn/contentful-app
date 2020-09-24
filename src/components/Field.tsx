import React, {useState, useEffect} from 'react';
import { Paragraph } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import ReactQuill from 'react-quill';
import Showdown from 'showdown';
import TurndownService from 'turndown';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [
      { 'header': [1, 2, false] }
    ],
    ['bold', 'italic'],
    [
      {'list': 'ordered'},
      {'list': 'bullet'}
    ]
  ]
};
const formats = ['header','bold', 'italic', 'underline', 'strike', 'blockquote','list', 'bullet', 'indent','link', 'image'];
const converter = new Showdown.Converter();
const turndownService = new TurndownService();

interface FieldProps { sdk: FieldExtensionSDK; }

const Field = (props: FieldProps) => {
  const [value, setValue] = useState('');

  useEffect (()=> {                           // useEffect for debounce hook
    if (value==='') {                         // Initial load of CMS - update quill
      props.sdk.space.getEntry(props.sdk.entry.getSys().id)
      .then((entryRef: any) => {
      setValue(converter.makeHtml(entryRef.fields.Body.en));
      });
    } else {                                  // Component updated
      let debouncetimer = setTimeout(() => {  // Initiate debounce timer
        let now = new Date().toJSON();
        console.log("Updating CMS: "+now);
        props.sdk.space.getEntry(props.sdk.entry.getSys().id)
        .then((entryRef: any) => {
          entryRef.fields.Body.en = turndownService.turndown(value);
          props.sdk.space.updateEntry(entryRef);
        })
      }, 750)                                 // Return timer and only fire after 750ms
      return () => {                          // Reset timeout for each state change
        clearTimeout(debouncetimer);
      }
    }
  })

  props.sdk.window.updateHeight(650);

  return <div>
      <Paragraph>
        <ReactQuill id='quillmain' modules={modules} formats={formats} theme="snow" value={value} onChange={setValue}/>
      </Paragraph>
    </div>
  ;
};

export default Field;
