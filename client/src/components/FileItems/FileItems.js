import React from "react";

export default class FileItem extends React.Component{

    constructor(name,isDirectory,path){
        super();
        this.name=name;
        this.isDirectory=isDirectory;
        this.path=path;
        if(isDirectory){
            this.children = [];
        }

        this.addItem = this.addItem.bind(this);
        this.rename=this.rename.bind(this);
    }


    addItem(name , isdir) {
        const path= this.path +"/"+ name;
        const item = new FileItem(name,isdir,path);
        
        this.children.push(item);
    }   
        
    rename(name,index){
        
        const path=this.path.split("/");

        if(path.length===1){
            this.path= name;
            this.name= name;
        }
        else{
            let newpath=path[0];
            for(var i=1;i<path.length;i++){
                if(i===path.length+index){
                    newpath=newpath+"/"+name;
                }else{
                    newpath=newpath+"/"+path[i];
                }
            }

            this.path= newpath;

            if(index===-1){
                this.name= name;
            }
        }
        
        if(this.isDirectory &&  this.children.length ){
            this.children.forEach(child => {child.rename(name,index-1);});
        }
       
    }

}