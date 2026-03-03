# Timberborn Display Generator

## What is? What do?

This script generates a vertical HTTP-ready display in Timberborn, for any size you want.

## How do?

This tutorial assumes you have node.js installed and are familiar with running node.js scripts

Create a new folder and add the files attached.
Open the folder in a terminal window and run npm install and then node GenerateDisplay.js
note: there are variables in the js file to define the size of display you want

And that's it! It will spit out an output.json file, which you should open, copy the entirety of, and replace the Entities array of the world.json file. Then that world.json file can be plonked into a .timber file and you're off to the races!
