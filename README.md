# RH Event Registration Landing Page

A modern and responsive landing page built with Next.js and Tailwind CSS for event registration data collection, integrated with Google Apps Script.

## 🚀 Features

- **Dark Design**: Professional dark theme inspired by RH.com
- **Responsive**: Works perfectly on desktop, tablet and mobile
- **Intuitive Form**: Organized fields with real-time validation
- **Google Sheets Integration**: Sends data directly to a Google spreadsheet
- **Visual Feedback**: Success and error messages for better UX
- **Loading States**: Visual indicators during submission

## 📋 Form Fields

The form collects the following data:
- **First Name**: Participant's first name (required)
- **Last Name**: Participant's last name (required)
- **Email**: Email address (required)
- **Are you bringing a plus one**: Checkbox for plus one (Yes/No)
- **Date**: **Automatic** (current date when submitted)

## 🛠️ Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Static typing for better development
- **Tailwind CSS**: Utility CSS framework
- **Google Apps Script**: To process data and save to spreadsheet

## 📦 Installation and Setup

1. **Clone the repository**:
```bash
git clone <your-repository>
cd carlos
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run in development mode**:
```bash
npm run dev
```

4. **Access the application**:
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Google Apps Script Configuration

For the form to work correctly, you need to configure Google Apps Script. Here's the necessary code:

```javascript
function doPost(e) {
  try {
    // Parse the JSON data from the request
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet and the specific sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("RH-LP");
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = spreadsheet.insertSheet("RH-LP");
      newSheet.appendRow([
        "First Name",
        "Last Name", 
        "Email",
        "Are you bringing a plus one",
        "Date",
        "Timestamp"
      ]);
    }
    
    // Prepare the row data
    const rowData = [
      data["First Name"] || "",
      data["Last Name"] || "", 
      data["Email"] || "",
      data["Are you bringing a plus one"] || "No", // Will be "Yes" or "No"
      data["Date"] || new Date().toISOString().split('T')[0], // Current date if not provided
      new Date().toISOString() // Add timestamp
    ];
    
    // Append the data to the sheet
    const targetSheet = sheet || spreadsheet.getSheetByName("RH-LP");
    targetSheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        "result": "success",
        "message": "Data saved successfully",
        "timestamp": new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        "result": "error", 
        "error": error.toString(),
        "timestamp": new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      "status": "Form submission endpoint is working!",
      "timestamp": new Date().toISOString(),
      "instructions": "Use POST method to submit form data"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Steps to configure Google Apps Script:

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Paste the code above
4. Save the project
5. Click "Deploy" > "New deployment"
6. Choose "Web app" as type
7. Configure necessary permissions
8. Copy the generated URL and update it in the application code

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other platforms
The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📱 Responsiveness

The landing page is fully responsive and adapts to different screen sizes:
- **Desktop**: Two-column layout for name fields
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Single-column layout for better usability

## 🎨 Customization

### Colors and Style
Colors can be easily customized by editing the Tailwind classes in the `src/app/page.tsx` file:

- **Main background**: `bg-black`
- **Form card**: `bg-gray-900`
- **Input fields**: `bg-gray-800`
- **Blue accent**: `text-blue-400`, `bg-blue-600`
- **Success colors**: `green-900`, `green-400`, `green-300`
- **Error colors**: `red-900`, `red-400`, `red-300`

### Texts
All texts can be edited directly in the main component:
- Page title
- Event description
- Field labels
- Feedback messages

## 🔒 Security

- Required field validation
- Frontend data sanitization
- HTTPS for data transmission
- Proper error handling

## 📊 Monitoring

To monitor submissions, you can:
1. Check the Google Sheets spreadsheet
2. Add logs in Google Apps Script
3. Implement analytics (Google Analytics, etc.)

## 🚀 Recent Updates (v2.1)

### Form Simplification:
- ✅ **Automatic Date**: Removed manual date field, now uses current date automatically
- ✅ **Plus One Checkbox**: Replaced select with more intuitive checkbox
- ✅ **English Texts**: All texts translated to English
- ✅ **Better UX**: Simpler and more direct form

### Technical Improvements:
- **Boolean Type**: PlusOne field is now boolean instead of string
- **Simplified Validation**: Fewer validations needed
- **Enhanced UX**: More direct and easier to use form

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT license. See the `LICENSE` file for more details.

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact via email

## 🔧 Troubleshooting

### Problem: "Script function not found: doGet"
**Solution**: Make sure the Google Apps Script has the `doPost` and `doGet` functions

### Problem: Data doesn't appear in spreadsheet
**Solution**: 
1. Check if the spreadsheet has a sheet named "RH-LP"
2. Run the `testSheetConnection()` function in Google Apps Script
3. Check the logs in Google Apps Script

### Problem: CORS error
**Solution**: The code is already configured with `mode: 'no-cors'` to avoid CORS issues

### Problem: Checkbox doesn't work
**Solution**: The checkbox is configured correctly. Check if JavaScript is enabled in the browser.

---

Developed with ❤️ using Next.js and Tailwind CSS
