import React, {useState, useEffect} from 'react';
import { Paragraph } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import ReactQuill from 'react-quill';
import Showdown from 'showdown';
import TurndownService from 'turndown';
import 'react-quill/dist/quill.snow.css';

const formats = ['header','bold', 'italic', 'underline', 'strike', 'blockquote','list', 'bullet', 'indent','link', 'image'];

let icons = ReactQuill.Quill.import("ui/icons");
icons["undo"] = `<svg viewbox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon><path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path></svg>`;
icons["redo"] = `<svg viewbox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path></svg>`;
icons["help"] = `<svg viewbox="0 0 18 18"><circle r="7" fill="#fff" /><path d="M6.88,11.059 L6.88,13 L9.231,13 L9.231,11.059 Z M8,16 C3.582,16 0,12.418 0,8 C0,3.582 3.582,0 8,0 C12.418,0 16,3.582 16,8 C16,12.418 12.418,16 8,16 Z M5.57,3.51 C4.586,4.043 4.063,4.948 4,6.224 L6.28,6.224 C6.28,5.852 6.408,5.494 6.663,5.149 C6.918,4.804 7.35,4.632 7.961,4.632 C8.581,4.632 9.009,4.772 9.243,5.052 C9.477,5.332 9.594,5.642 9.594,5.982 C9.594,6.277 9.488,6.548 9.278,6.794 L8.821,7.191 L8.245,7.574 C7.677,7.95 7.324,8.282 7.187,8.571 C7.051,8.86 6.966,9.382 6.935,10.139 L9.065,10.139 C9.07,9.781 9.105,9.517 9.168,9.347 C9.268,9.078 9.47,8.843 9.775,8.641 L10.335,8.272 C10.903,7.896 11.287,7.587 11.487,7.345 C11.829,6.947 12,6.456 12,5.874 C12,4.925 11.607,4.209 10.821,3.725 C10.034,3.242 9.047,3 7.858,3 C6.953,3 6.191,3.17 5.57,3.51 Z M5.57,3.513" fill="#000" fill-rule="evenodd" /></svg>`;

let Link = ReactQuill.Quill.import('formats/link');

Link.sanitize = function(url: any) {
  if (this.PROTOCOL_WHITELIST.indexOf("action") < 0) { 
    this.PROTOCOL_WHITELIST.push("action")
  }
  let protocol = url.slice(0, url.indexOf(':'));
  let anchor = document.createElement('a');
  anchor.href = url;
  protocol = anchor.href.slice(0, anchor.href.indexOf(':'));
  return (this.PROTOCOL_WHITELIST.indexOf(protocol) > -1) ? url : this.SANITIZED_URL;
}

ReactQuill.Quill.register(Link, true);

Showdown.extension("noLineBreakLists", function() {
  return [
    {
        type    : 'html',
        regex   : '</p>\n<ul>',
        replace : '</p><p><ul>'
    }
  ]
});

Showdown.extension("paraBlockAd", function() {
  return [
    {
        type    : 'html',
        regex   : '<p class=\"inline ad\"><\/p>',
        replace : '<p><img src="https://images.ctfassets.net/srdmz6yont2x/2wXVLCDB2oTwQYqFhdwHWc/4038621ecfbebdf5da25de515d66a6a8/ad_placeholder.png?h=250" alt="Ad Placeholder"></p>'
    }
  ]
});

const converter = new Showdown.Converter();
converter.useExtension("noLineBreakLists");
converter.useExtension("paraBlockAd");
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
          if(value==="<p><br></p>") {
            // Intercept write of breakspaces
            if (typeof(entryRef.fields.Body)!='undefined') {
              entryRef.fields.Body.en = turndownService.turndown("<p><br>&nbsp;<br>&nbsp;<br></p>");
            } else {
              entryRef.fields.Body = {};
              entryRef.fields.Body.en = turndownService.turndown("<p><br>&nbsp;<br>&nbsp;<br></p>");
            }
          } else {
            let newEntry = turndownService.turndown(value)
            newEntry = newEntry.replace('![](https://images.ctfassets.net/srdmz6yont2x/2wXVLCDB2oTwQYqFhdwHWc/4038621ecfbebdf5da25de515d66a6a8/ad_placeholder.png?h=250)', '<p class="inline ad"></p>');
            if (typeof(entryRef.fields.Body)!='undefined') {
              entryRef.fields.Body.en = newEntry;
            } else {
              entryRef.fields.Body = {};
              entryRef.fields.Body.en = newEntry;
            }
          }
          if (!mdLoad) {
            // Intercept write of empty string to avoid versioning issue
            if (JSON.stringify(entryRef.fields.Body)==='{"en":""}') {
              entryRef.fields.Body.en = " ";
            }
            let entrySys=props.sdk.entry.getSys()
            let entryPublished=false
            if (entrySys.version<(entrySys.publishedVersion+2)) {
              entryPublished=true
            }
            props.sdk.field.setValue(entryRef.fields.Body.en);
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
        ['image'],
        ['undo'],
        ['redo'],
        ['help']
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
              console.log("Image addition")
              setValue(valueRef);
            }
          });
        }, []),
        'undo': React.useCallback(undoFunc => {
          let myEditor: any = mainRef!.current!.getEditor();
          myEditor.history.undo()
        }, []),
        'redo': React.useCallback(undoFunc => {
          let myEditor: any = mainRef!.current!.getEditor();
          myEditor.history.redo()
        }, []),
        'help': React.useCallback(helpFunc => {
          window.open("https://app.getguru.com/card/cMK8Rbyi/Rich-Text-Editor-manual" , '_blank');
        }, []),
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
