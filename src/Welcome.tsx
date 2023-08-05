import React from "react"
import { removeFromLocalStorage } from "./util"

const onLogOut = async () => {
    await removeFromLocalStorage("access_token");
}

export const Welcome = () => {
    return (
        <>
            <div>Welcome</div>
            <button onClick={() => onLogOut()}>log out</button>
        </>
    )
}

