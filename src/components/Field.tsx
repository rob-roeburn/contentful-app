import React, {useState, useEffect} from 'react';
import { Paragraph } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import ReactQuill from 'react-quill';
import Showdown from 'showdown';
import TurndownService from 'turndown';
import 'react-quill/dist/quill.snow.css';

const formats = ['header','bold', 'italic', 'underline', 'strike', 'blockquote','list', 'bullet', 'indent','link', 'image', 'undo', 'redo'];

let icons = ReactQuill.Quill.import("ui/icons");
icons["undo"] = `<svg viewbox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon><path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path></svg>`;
icons["redo"] = `<svg viewbox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path></svg>`;

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
  }, [])

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
        ['image'],
        ['undo'],
        ['redo']
      ],
      handlers: {
        'image': function () {
          let valueHTML=value;
          props.sdk.dialogs.selectMultipleAssets()
          .then( (promiseData: any) => {
            if (typeof(promiseData) != 'undefined') {
              promiseData.forEach((result: any) => {
                valueHTML+="<img alt=\""+result.fields.file.en.fileName.split('.')[0]+"\" src=\""+result.fields.file.en.url+"\">";
              });
              setValue(valueHTML);
            }
          });
        },
        'undo': function () {
          console.log("clicked Undo")
          console.log(mainRef.current)
        },
        'redo': function () {
          console.log("clicked Redo")
          console.log(mainRef.current)
        }
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
