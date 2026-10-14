Jones Automation Exercise

Automation for the form on https://test.netlify.app/ with Playwright.


How to run

You need Node.js 20 or newer. In the project folder run:

    npm install
    npx playwright install chromium
    npm start

The second command downloads the browser, it's needed only the first time.

If you want to see the browser while it runs:

    npm run start:headed


What it does

1. Opens the site
2. Types values in Name, Email, Phone, Company and Website
3. Bonus - changes Number of Employees from 1-10 to 51-500, and checks that it really changed
4. Takes a screenshot of the page (screenshots/before-submit.png)
5. Clicks "Request a call back"
6. Waits for the thank you page and writes to the console

When it works, the console looks like this:

    Opened https://test.netlify.app/
    Filled Name, Email, Phone, Company and Website
    Changed Number of Employees to 51-500
    Saved screenshot to ...\screenshots\before-submit.png
    Reached the thank you page: https://test.netlify.app/thank-you.html?...

If something fails, it saves screenshots/failure.png, prints the error and exits with code 1.


Some choices I made

I used the Playwright library and not the test runner (@playwright/test), because the exercise asks for an automation file that writes to console.log, and the links in the exercise point to the library. If it was a real project with many tests I would go with the test runner, for the assertions, retries and the HTML report.

All the fields have an id, so I used the ids. The button doesn't have one, so I found it by its text.

For the fields I used fill() and not typing key by key. Key by key is needed only when the page does something on every key press, and here it doesn't.

There are no fixed waits (sleep). Playwright waits for the elements by itself, and for the thank you page I wait for the URL and also check the "Thank You!" heading. Getting to the URL alone doesn't prove the page really loaded.

I take the screenshot after changing the dropdown, so it shows exactly what is being sent.


Bugs I found on the site

SITE-01: Personal data is sent in the URL
Severity: High
Description: The form has no method, so it is sent with GET. Name, email and phone end up in browser history and server logs.
Steps to reproduce:
1. Open https://test.netlify.app/
2. Fill all fields and click "Request a call back"
Actual: The thank you page URL contains the name, email and phone.
Expected: The form is sent with POST and the data is not in the URL.

SITE-02: Website placeholder doesn't match the validation
Severity: Medium
Description: The placeholder is "example.com", but the field is type="url" and needs https://.
Steps to reproduce:
1. Open https://test.netlify.app/
2. Fill all fields, in Website type example.com (like the placeholder)
3. Click "Request a call back"
Actual: The form is not sent, the browser shows "Please enter a URL."
Expected: The placeholder shows https://example.com, or the field accepts a value without https://.
Workaround: Type https:// before the address.

SITE-03: Phone field accepts any text
Severity: Medium
Steps to reproduce:
1. Open https://test.netlify.app/
2. Fill all fields, in Phone type abc
3. Click "Request a call back"
Actual: The form is sent and the thank you page opens.
Expected: An error that the phone number is not valid.

SITE-04: Font is blocked (mixed content)
Severity: Low
Description: The page is HTTPS but loads the Open Sans font over HTTP.
Steps to reproduce:
1. Open https://test.netlify.app/ with the DevTools console open
Actual: "Mixed Content" error in the console, the font is blocked and the page shows a default font.
Expected: The font is loaded over HTTPS, no errors in the console.
