<?php
 
namespace App\Http\Controllers;
 
use GuzzleHttp\Client;  
 
use Illuminate\Http\Request;
 
class WhatsAppController extends Controller
{
    public function sendBill(Request $request)
    {
        try {
            // Get the phone number and bill file from the request
            $phoneNumber = $request->input('phone_number');
            $billFile = $request->file('bill_file');
 
            if (!$phoneNumber || !$billFile) {
                return response()->json(['error' => 'Phone number and bill file are required'], 400);
            }
 
            // Validate phone number format
            if (!preg_match('/^\+?[1-9]\d{1,14}$/', $phoneNumber)) {
                return response()->json(['error' => 'Invalid phone number format'], 400);
            }
 
            $fileName = $billFile->getClientOriginalName();
 
            // Upload the bill file to WhatsApp API and get the media_id
            $mediaId = $this->uploadMedia($billFile);
 
            // Send the bill to WhatsApp using the media_id
            return $this->sendMessage($phoneNumber, $mediaId, $fileName);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
 
    private function uploadMedia($file)
    {
        $client = new Client();
        $response = $client->post('https://graph.facebook.com/v21.0/482346864961658/media', [
            'headers' => [
                'Authorization' => 'Bearer EAAXDOdIVS2ABO0pcYo6OZCMESZCtXJZCnnj7zIcBQTJNCwjT5i1JBtmH0WxcEbLmLnElrepsRGZBT9thPqkLF4SYWk0I4I9GupWz30ZBSYoxNZCAYNWxByBZCv2f4JNgE5cUZBl9dAgoRlJuMtE4bZABGn6cPZAiUG2vMVOap1myLd24sZBhro9CwDeoZBZBGgSIasvpr5QZDZD', // Replace with your actual access token
            ],
            'multipart' => [
                [
                    'name' => 'file',
                    'contents' => fopen($file->getPathname(), 'r'),
                    'filename' => $file->getClientOriginalName(),
                ],
                [
                    'name' => 'messaging_product',
                    'contents' => 'whatsapp',
                ],
            ],
        ]);
 
        $data = json_decode($response->getBody(), true);
        return $data['id']; // The media_id returned from the upload
    }
 
 
 
     private function sendMessage($phoneNumber, $mediaId, $fileName)
    {
        $client = new Client();
        $response = $client->post('https://graph.facebook.com/v21.0/482346864961658/messages', [
            'headers' => [
                'Authorization' => 'Bearer EAAXDOdIVS2ABO0pcYo6OZCMESZCtXJZCnnj7zIcBQTJNCwjT5i1JBtmH0WxcEbLmLnElrepsRGZBT9thPqkLF4SYWk0I4I9GupWz30ZBSYoxNZCAYNWxByBZCv2f4JNgE5cUZBl9dAgoRlJuMtE4bZABGn6cPZAiUG2vMVOap1myLd24sZBhro9CwDeoZBZBGgSIasvpr5QZDZD', // Replace with your actual access token
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'messaging_product' => 'whatsapp',
                'to' => $phoneNumber,
                'type' => 'document',
                'document' => [
                    'id' => $mediaId,
                    'caption' => 'Your bill is attached, get well soon!',
                    'filename' => $fileName,
                ]
            ]
        ]);
 
        return response()->json(json_decode($response->getBody(), true));
    }
}
