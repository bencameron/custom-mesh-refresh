# Custom Mesh Refresh

## Background

This repo was created to reproduce an issue with in version 7.71 of the Forge Viewer where removing custom meshes and then re-adding causes an error. `FragmentList.getMaterial()` blows up due to not finding a specific `fragId` (seems to always be 0) in `vizmeshes`.

This is a simplified version of a production application that uses various custom meshes via the `ModelBuilder` extension. For this simplified version, only cylinders are being used.

## Reproducing the Issue

Run the web application using any web server. The [dotnet-serve](https://www.nuget.org/packages/dotnet-serve/) .NET global tool is an easy way to do this, but any web server will work. After all meshes have rendered, click the blank button at the far right of the toolbar. Within the console in the browser dev tools, you will see many instances of "Uncaught TypeError: Cannot read properties of undefined (reading 'material')".
