'use client';
import { DailyProvider, } from "@daily-co/daily-react";
import { useRef, useState } from "react";
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import Tile from "@/Components/Tile";

export default function Home() {
  const [tempRoomUrl, setTempRoomUrl] = useState<string>("");
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const myCallObjRef = useRef<DailyCall | null>(null);
  
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  
  const loadChatbot = async () => {
    if (myCallObjRef.current) {

      let chatbotFound: boolean = false;

      const participants = myCallObjRef.current.participants();
      for (const [key, participant] of Object.entries(participants)) {
        if (participant.user_name === "Chatbot") {
          setChatbotId(participant.session_id);
          chatbotFound = true;
          break; // Stop iteration if you found the Chatbot
        }
      }
      if (!chatbotFound) {
        setTimeout(loadChatbot, 1000);
      }
    } else {
      setTimeout(loadChatbot, 1000);
    }
  };

  const handleLeaveRoom = async () => {
    if (callObject) {
      await callObject.leave();
      setCallObject(null);
    } else {
      console.log("CallObject is null");
    }
  }

  const handleMute = async () => {
    if (callObject) {
      callObject.setLocalAudio(false);
    } else {
      console.log("CallObject is null");
    }
  }


  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {
        callObject && (
          <DailyProvider callObject={callObject}>
            {
              chatbotId && (
                <Tile key={chatbotId} id={chatbotId} />

              )
            }
          </DailyProvider>
        )
      }

      <input type="text" className="bg-slate-100 px-2 py-1 rounded-md" placeholder="Room URL" value={tempRoomUrl} onChange={(e) => setTempRoomUrl(e.target.value)} />

      <div className="flex flex-row gap-2">

        <button className="bg-green-500 text-white px-2 py-1 rounded-md" onClick={async () => {
          console.log("Joining room", tempRoomUrl)

          let newCallObject = DailyIframe.getCallInstance();

          if (newCallObject === undefined) {
            newCallObject = DailyIframe.createCallObject({
              videoSource: false,
            });
          }

          newCallObject.setUserName("My name");

          await newCallObject.join({ url: tempRoomUrl });
          myCallObjRef.current = newCallObject;
          console.log("Joined the room with callObject", newCallObject);
          setCallObject(newCallObject);

          setTimeout(loadChatbot, 2000);


        }}>Join room</button>
        <button className="bg-red-500 text-white px-2 py-1 rounded-md" onClick={handleLeaveRoom}>Leave room</button>
        <button className="bg-slate-500 text-white px-2 py-1 rounded-md" onClick={handleMute}>Mute</button>
      </div>
    </div>
  );
}
