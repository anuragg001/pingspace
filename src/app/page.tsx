"use client";
import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const Page = () => {
  return <Suspense>
    <Lobby />
  </Suspense>
}


function Lobby() {
  const { username } = useUsername();
  const router = useRouter();
  const [joinRoomId, setJoinRoomId] = useState("");
  
  const searchParams = useSearchParams();
  const wasDestroyed = searchParams.get("destroyed") === "true";
  const error = searchParams.get("error");
  
  const { mutate: createRoom } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post(); //fetch call to backend
      
      if (res.status === 200) {
        router.push(`/room/${res.data?.roomId}`);
      }
    }
  })

  const joinRoom = () => {
    const roomId = joinRoomId.trim();
    if (!roomId) return;
    router.push(`/room/${roomId}`);
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 ">
      <div className="w-full max-w-md  space-y-8">
        {wasDestroyed && (<div className="bg-red-950/50 border border-red-900 p-4 text-center ">
          <p className="text-red-500 text-sm font-bold">ROOM DESTROYED</p>
          <p className="text-zinc-500 text-xs mt-1 ">All messages were permanently deleted.</p>
        </div>)}
        {error === "room-not-found" && (<div className="bg-red-950/50 border border-red-900 p-4 text-center ">
          <p className="text-red-500 text-sm font-bold">ROOM NOT FOUND!!</p>
          <p className="text-zinc-500 text-xs mt-1 ">This room may have expired or never existed.</p>
        </div>)}
        {error === "room-full" && (<div className="bg-red-950/50 border border-red-900 p-4 text-center ">
          <p className="text-red-500 text-sm font-bold">ROOM FULL!!</p>
          <p className="text-zinc-500 text-xs mt-1 ">This room is at maximum capacity.</p>
        </div>)}


        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-green-500">{">"} pingspace</h1>
          <p className="text-zinc-500 text-sm">A private, self-destructing pingspace.</p>
        </div>
        <div className="border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md ">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center text-zinc-500">Your Identity</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono ">
                  {username}
                </div>
              </div>
            </div>
            <button onClick={() => createRoom()}
              className="w-full bg-zinc-100 text-black p-3 text-sm font-bold hover:bg-zinc-50 hover:text-black transition-colors mt-2 cursor-pointer disabled:opacity-50">
              Create Secure Room
            </button>

            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <label className="flex items-center text-zinc-500">Join Another Room</label>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    joinRoom();
                  }
                }}
                placeholder="Paste room ID"
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700"
              />
              <button
                onClick={joinRoom}
                disabled={!joinRoomId.trim()}
                className="w-full bg-zinc-800 text-zinc-200 p-3 text-sm font-bold hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Page;