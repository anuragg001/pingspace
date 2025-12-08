import { NextRequest, NextResponse } from "next/server"
import { redis } from "./lib/redis";
import { nanoid } from "nanoid";

export const proxy =async (req: NextRequest) => {
    //Overview :Check if user is allowed to join the room
    //if they are let them pass ,if not sent them to lobby 
    const pathname = req.nextUrl.pathname;

    const roomMatch = pathname.match(/^\/room\/([^\/]+)$/);
    if (!roomMatch) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const roomId = roomMatch[1];

    const meta = await redis.hgetall<{connected: string[]; createdAt : number}>(`meta:${roomId}`);

    if(!meta){
        return NextResponse.redirect(new URL("/?error=room-not-found", req.url));

    }

    //for not generating extra token more than 2 
    const existingToken = req.cookies.get("x-auth-tokem")?.value;

    //user is allowed if they have a valid token in connected list
    if(existingToken && meta.connected.includes(existingToken)){
        return NextResponse.next();
    }

    //use is not allowed to join the room if room is full or id is not same 
    if(meta.connected.length >=2){
        return NextResponse.redirect(new URL("/?error=room-full", req.url));
    }

    const response = NextResponse.next();
    const token = nanoid();
    response.cookies.set("x-auth-token",token,
        {
            path:"/",
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
        }
    )
    await redis.hset(`meta:${roomId}`,{
        connected:[...meta.connected,token],
    })
    return response
}

export const config = {
    matcher: "/room/:path*",

}