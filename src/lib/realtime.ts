import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { literal, z } from "zod";
import { redis } from "@/lib/redis";
//message schema ,destroy schema

const message = z.object({
            id: z.string(),
            sender: z.string(),
            text : z.string(),
            timestamp: z.number(),
            roomId  : z.string(),
            token: z.string().optional(),
        });

const schema ={
    chat:{
        message,
        destroy:z.object({
            isDestroyed: z.literal(true),

        })
    }
}
export const realtime  = new Realtime({schema ,redis})
export type  RealtimeEvents = InferRealtimeEvents<typeof realtime>
export type Message = z.infer<typeof message>;