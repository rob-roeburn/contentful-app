import React, {useState, useEffect} from 'react';
import { Paragraph } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import ReactQuill from 'react-quill';
import Showdown from 'showdown';
import TurndownService from 'turndown';
import 'react-quill/dist/quill.snow.css';

const formats = ['header','bold', 'italic', 'underline', 'strike', 'blockquote','list', 'bullet', 'indent','link', 'image'];

Showdown.extension("noLineBreakLists", function() {
  return [
    {
        type    : 'html',
        regex   : '</p>\n<ul>',
        replace : '</p><p><ul>'
    }
  ]
});

const converter = new Showdown.Converter();
converter.useExtension("noLineBreakLists");
converter.setOption('simpleLineBreaks', true);
const turndownService = new TurndownService();
let mdLoad = true;

interface FieldProps { sdk: FieldExtensionSDK; }

let mainRef = React.createRef<ReactQuill>();

const Field = (props: FieldProps) => {
  const [value, setValue] = useState('');

  useEffect (()=> {                           // useEffect for debounce hook
    if (value==='') {                         // Initial load of CMS - update quill
      props.sdk.space.getEntry(props.sdk.entry.getSys().id)
      .then((entryRef: any) => {
        if (typeof(entryRef.fields.Body)!='undefined') {
          setValue(converter.makeHtml(entryRef.fields.Body.en));
        } else {
          entryRef.fields.Body = {};
          entryRef.fields.Body.en = '';
          setValue(converter.makeHtml(entryRef.fields.Body.en));
        }
      });
      mdLoad=false;
    } else {                                  // Component updated
      let debouncetimer = setTimeout(() => {  // Initiate debounce timer
        let now = new Date().toJSON();
        props.sdk.space.getEntry(props.sdk.entry.getSys().id)
        .then((entryRef: any) => {
          if (typeof(entryRef.fields.Body)!='undefined') {
            entryRef.fields.Body.en = turndownService.turndown(value);
          } else {
            entryRef.fields.Body = {};
            entryRef.fields.Body.en = turndownService.turndown(value);
          }
          if (!mdLoad) {
            props.sdk.space.updateEntry(entryRef);
            console.log("Updating CMS: "+now);
          }
          mdLoad=false;
        })
      }, 750)                                 // Return timer and only fire after 750ms
      return () => {                          // Reset timeout for each state change
        clearTimeout(debouncetimer);
      }
    }
  })

  props.sdk.window.startAutoResizer();

  const modules = {
    toolbar: {
      container: [
        [
          { 'header': [1, 2, false] }
        ],
        ['bold', 'italic'],
        [
          {'list': 'ordered'},
          {'list': 'bullet'}
        ],
        ['link'],
        ['image']
      ],
      handlers: {
        'image': React.useCallback(imageFunc => {
          let valueRef=String(mainRef.current!.value);
          props.sdk.dialogs.selectMultipleAssets()
          .then( (promiseData: any) => {
            if (typeof(promiseData) != 'undefined') {
              promiseData.forEach((result: any) => {
                valueRef+="<img alt=\""+result.fields.file.en.fileName.split('.')[0]+"\" src=\""+result.fields.file.en.url+"\">";
              });
              setValue(valueRef);
            }
          });
        }, [])
      }
    },
    history: {
      delay: 200,
      maxStack: 500,
      userOnly: true
    }
  };

  return <div>
      <Paragraph>
        <ReactQuill id='quillmain' modules={modules} formats={formats} theme="snow" value={value} onChange={setValue} ref={mainRef}/>
      </Paragraph>
    </div>
  ;
};

export default Field;
