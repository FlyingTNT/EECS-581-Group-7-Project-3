import type { ReactNode } from "react";
import React from "react";
import { Button } from "@mui/material";
import { get101s } from "../utils/uilities.ts"

// Given when the component is made
interface TestProps{
    num: number;
}

// Updated over the component's lifetime
interface TestState{
    num: number;
    down: number;
}

export default class Test extends React.Component<TestProps, TestState>
{
    constructor(props: TestProps)
    {
        super(props);
        this.state = {num: 0, down: 0};
    }

    me(){
        if(this.state.down > 0)
        this.setState({num: this.state.num + 1});
    }

    render(): ReactNode 
    {
        return (
            <div onMouseEnter={() => this.me()} onMouseDown = {e => {if(e.button == 2) this.setState({down: this.state.down + 1});}} onMouseUp = {e => {if(e.button == 2) this.setState({down: this.state.down - 1});}}>
                <h1>Test {this.props.num} {this.state.num} {get101s().length}</h1>
                <Button variant="contained" onClick={() => this.setState({num: this.state.num + 1})}>
                    Increment
                </Button>
            </div>
        );
    }
}