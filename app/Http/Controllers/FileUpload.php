<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;

class FileUpload extends Controller
{

  //File Upload Function
  public function fileUpload(Request $request){
        $request->validate([
            'file' => 'required|mimes:jpg,jpeg,png|max:2048',
            'dest' => 'required'
        ]);

        //check file
        if ($request->hasFile('file'))  
        {
            $file      = $request->file('file');
            $filename  = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $picture   = $request['dest'].'/'.date('His').'-'.$filename;
            //move image to public/img folder
            $file->move(public_path(env('UPLOAD_PATH').'img/'.$request['dest']), $picture);
            return response()->json([
                "success" => true,
                "message" => "Image Uploaded Succesfully",
                "fileName"=>$picture
            ]);
        } 
        else
        {
            return response()->json([
                "success" => false,
                "message" => "Please select an image"
            ]);
        }
   }

   //File Upload Function
  public function filesUpload(Request $request){
    $request->validate([
        'file' => 'required',
        'dest' => 'required'
    ]);

    //check file array exists then upload all one by one
    if ($request->hasFile('file'))
    {
        $files      = $request->file('file');
        $uploadedFiles = array();
        foreach ($files as $file) {
            $filename  = $file->getClientOriginalName();
            $filename  = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $picture   = $request['dest'].'/'.date('His').'-'.$filename;
            //move image to public/img folder
            $file->move(public_path('img/'.$request['dest']), $picture);
            array_push($uploadedFiles,$picture);
        }
        return response()->json([
            "success" => true,
            "message" => "Image Uploaded Succesfully",
            "files"=>$uploadedFiles
        ]);
    } 
    else
    {
        return response()->json([
            "success" => false,
            "message" => "Please select an image"
        ]);
    }
}

}
