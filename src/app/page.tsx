'use client';
import { DailyProvider, useParticipantIds, } from "@daily-co/daily-react";
import { useRef, useState } from "react";
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import Tile from "@/Components/Tile";

type E2EBody = {
  apiKey: string;
  faceId: string;
  voiceId: string;
  systemPrompt?: string;
  firstMessage?: string;
}

export default function Home() {
  const [tempRoomUrl, setTempRoomUrl] = useState<string>("");
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const myCallObjRef = useRef<DailyCall | null>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [faceId, setFaceId] = useState<string>("");
  const [voiceId, setVoiceId] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [firstMessage, setFirstMessage] = useState<string>("");

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

  const handleJoinRoom = async () => {
    let roomUrl = tempRoomUrl.toString();
    if (roomUrl === "") {
      if (apiKey.trim() === "" || faceId.trim() === "" || voiceId.trim() === "") {
        console.log("API Key, Face ID, Voice ID, and Prompt are required");
        window.alert("API Key, Face ID, Voice ID, and Prompt are required");
        return;
      }
      const body: E2EBody = {
        apiKey: apiKey.trim(),
        faceId: faceId.trim(),
        voiceId: voiceId.trim(),
        systemPrompt: prompt.trim(),
        firstMessage: firstMessage.trim(),
      }
      // Remove systemPrompt and firstMessage if they are empty
      if (prompt.trim() === "") {
        delete body.systemPrompt;
      }
      if (firstMessage.trim() === "") {
        delete body.firstMessage;
      }

      // Call the API to get the room URL
      const response = await fetch("https://api.simli.ai/startE2ESession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json();
      roomUrl = data.roomUrl;
    }

    let newCallObject = DailyIframe.getCallInstance();

    if (newCallObject === undefined) {
      newCallObject = DailyIframe.createCallObject({
        videoSource: false,
      });
    }

    newCallObject.setUserName("My name");

    await newCallObject.join({ url: roomUrl });
    myCallObjRef.current = newCallObject;
    console.log("Joined the room with callObject", newCallObject);
    
    myCallObjRef.current.on('participant-joined', (event) => {
      console.log('joining-meeting event', event);
      const participantId = event.participant.session_id;
      const userName = event.participant.user_name;
      if (userName === "Chatbot" && chatbotId === null) {
        setChatbotId(participantId);
      }
    })

    setCallObject(newCallObject);
  }

  return (
    <div className="flex flex-col items-center justify-between p-10  h-screen">
      {
        callObject && (
          <div className="h-96 w-96 ">
            <DailyProvider callObject={callObject}>
              {
                chatbotId && (
                  <Tile key={chatbotId} id={chatbotId} />

                )
              }
            </DailyProvider>
          </div>
        )
      }

      {
        !callObject && (
          <div className="flex flex-row gap-4 items-center">
            <input type="text" className="bg-slate-100 px-2 py-1 rounded-md" placeholder="Room URL" value={tempRoomUrl} onChange={(e) => setTempRoomUrl(e.target.value)} />
            <div className="font-bold">OR</div>
            <div className="flex flex-col gap-2">
              <input type="text" className="bg-slate-100 px-2 py-1 rounded-md" placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              <input type="text" className="bg-slate-100 px-2 py-1 rounded-md" placeholder="Face ID" value={faceId} onChange={(e) => setFaceId(e.target.value)} />
              <input type="text" className="bg-slate-100 px-2 py-1 rounded-md" placeholder="Voice ID" value={voiceId} onChange={(e) => setVoiceId(e.target.value)} />
              <textarea className="bg-slate-100 px-2 py-1 rounded-md" placeholder="System Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
              <textarea className="bg-slate-100 px-2 py-1 rounded-md" placeholder="First Message" value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} />
            </div>
          </div>
        )
      }

      <div className="flex flex-row gap-2">

        <button className="bg-green-500 text-white px-2 py-1 rounded-md" onClick={handleJoinRoom}>Join room</button>
        <button className="bg-red-500 text-white px-2 py-1 rounded-md" onClick={handleLeaveRoom}>Leave room</button>
        <button className="bg-slate-500 text-white px-2 py-1 rounded-md" onClick={handleMute}>Mute</button>
        <Participants />
      </div>
    </div>
  );
}


function Participants() {
  const participantIds = useParticipantIds({
    filter: 'remote',
    sort: 'user_name',
  });

  return (
    <div className="flex flex-col">
      <h1>Participants</h1>
      <ul>

        {participantIds.map((id: string) => (
          <li key={id}>
            <Tile id={id} />
          </li>

        ))}
      </ul>

    </div>
  );
}
