# RH Event Registration Landing Page

A modern and responsive landing page built with Next.js and Tailwind CSS for event registration data collection, integrated with Google Apps Script.

## 🚀 Features

- **Dark Design**: Professional dark theme inspired by RH.com
- **Responsive**: Works perfectly on desktop, tablet and mobile
- **Advanced Form Validation**: Zod schema validation with React Hook Form
- **Custom Font System**: RH Sans, RH Serif, and Helvetica fonts
- **Google Sheets Integration**: Sends data directly to a Google spreadsheet
- **Visual Feedback**: Toast notifications for better UX
- **Loading States**: Visual indicators during submission
- **Confirmation Page**: Dedicated thank you page after successful submission
- **Code Quality**: Prettier formatting and TypeScript for better development

## 📋 Form Fields

The form collects the following data:

- **First Name**: Participant's first name (required)
- **Last Name**: Participant's last name (required)
- **Email**: Email address (required)
- **Number of Guests**: Radio button selection (1 or 2 guests)
- **Date**: **Automatic** (current date when submitted)

## 🛠️ Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Static typing for better development
- **Tailwind CSS**: Utility CSS framework
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation
- **Sonner**: Toast notifications
- **Google Apps Script**: To process data and save to spreadsheet
- **Prettier**: Code formatting

## 📦 Installation and Setup

1. **Clone the repository**:

```bash
git clone <your-repository>
cd rh-lp
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_FORM_URL=your_google_apps_script_web_app_url
```

4. **Run in development mode**:

```bash
npm run dev
```

5. **Access the application**:
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
        "Phone",
        "Number of Guests",
        "Date",
        "Timestamp",
      ]);
    }

    // Prepare the row data
    const rowData = [
      data["First Name"] || "",
      data["Last Name"] || "",
      data["Email"] || "",
      data["Phone"] || "",
      data["Number of Guests"] || "1",
      data["Date"] || new Date().toISOString().split("T")[0],
      new Date().toISOString(),
    ];

    // Append the data to the sheet
    const targetSheet = sheet || spreadsheet.getSheetByName("RH-LP");
    targetSheet.appendRow(rowData);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "success",
        message: "Data saved successfully",
        timestamp: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "error",
        error: error.toString(),
        timestamp: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "Form submission endpoint is working!",
      timestamp: new Date().toISOString(),
      instructions: "Use POST method to submit form data",
    })
  ).setMimeType(ContentService.MimeType.JSON);
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
8. Copy the generated URL and update it in your `.env.local` file

## 🎨 Custom Font System

The project includes a comprehensive custom font system:

### Available Fonts:
- **RH Sans**: Multiple weights (Hairline, UltraThin, Thin, ExtraLight, Light, Roman)
- **RH Serif**: Various weights and styles
- **RHC**: Condensed variant
- **Helvetica**: For placeholder text

### Usage:
```css
/* In CSS */
font-family: var(--font-rh-sans);
font-family: var(--font-rh-serif);
font-family: var(--font-rhc);
font-family: var(--font-helvetica);

/* In Tailwind */
font-rh-sans
font-rh-serif
font-rhc
font-helvetica
```

## 📁 Project Structure

```
src/
├── app/
│   ├── confirmation/     # Thank you page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main landing page
├── components/
│   ├── selector/        # Custom radio button component
│   ├── submissionForm/  # Main form component
│   ├── svg/            # SVG components
│   └── ui/             # shadcn/ui components
├── lib/
│   └── utils.ts        # Utility functions
└── styles/
    └── fonts.css       # Font definitions
```

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

Colors can be easily customized by editing the Tailwind classes:

- **Main background**: `bg-black`
- **Form fields**: `bg-black border-white`
- **Submit button**: `bg-white text-black`
- **Success colors**: Toast notifications
- **Error colors**: Form validation messages

### Fonts

Custom fonts are defined in `src/styles/fonts.css` and can be easily modified or extended.

## 🔒 Security & Validation

- **Zod Schema Validation**: Type-safe form validation
- **React Hook Form**: Efficient form state management
- **Required field validation**: Client-side validation
- **Frontend data sanitization**: Input cleaning
- **HTTPS for data transmission**: Secure data transfer
- **Proper error handling**: Comprehensive error management

## 📊 Monitoring

To monitor submissions, you can:

1. Check the Google Sheets spreadsheet
2. Add logs in Google Apps Script
3. Implement analytics (Google Analytics, etc.)
4. Monitor toast notifications in the UI

## 🚀 Recent Updates (v3.0)

### Form System Overhaul:

- ✅ **Zod Validation**: Type-safe schema validation
- ✅ **React Hook Form**: Professional form state management
- ✅ **Toast Notifications**: Better user feedback with Sonner
- ✅ **Custom Radio Buttons**: Replaced dropdown with styled radio buttons
- ✅ **Form Components**: shadcn/ui Form components for better structure

### Design Improvements:

- ✅ **Custom Font System**: RH Sans, RH Serif, RHC, and Helvetica
- ✅ **Autocomplete Styling**: Fixed yellow background in browsers
- ✅ **Placeholder Styling**: Custom Helvetica font for placeholders
- ✅ **Confirmation Page**: Dedicated thank you page

### Code Quality:

- ✅ **Prettier**: Automatic code formatting
- ✅ **TypeScript**: Improved type safety
- ✅ **Component Structure**: Better organization
- ✅ **Error Handling**: Comprehensive error management

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Deployment
npm run export       # Export static files
npm run deploy:vercel    # Deploy to Vercel
npm run deploy:netlify   # Deploy to Netlify
```

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
2. Verify the Google Apps Script URL in `.env.local`
3. Check the browser console for errors
4. Check the logs in Google Apps Script

### Problem: Form validation errors

**Solution**: The form uses Zod validation. Check the console for specific validation error messages.

### Problem: Fonts not loading

**Solution**: Ensure all font files are present in `src/fonts/` directory and properly referenced in `src/styles/fonts.css`.

### Problem: CORS error

**Solution**: The code is configured with `mode: 'no-cors'` to avoid CORS issues.

---

Developed with ❤️ using Next.js, TypeScript, and Tailwind CSS
