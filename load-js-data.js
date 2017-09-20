import GoogleSpreadsheet from 'google-spreadsheet';

export default function getGoogleSheetsData() {
  return new Promise((resolve, reject) => {
    const GOOGLE_SHEETS_KEY = process.env.GSKEY;
    if (GOOGLE_SHEETS_KEY.length == 0) {
      throw new Error(
        'GSKEY is not set! (this is the long id in the Google Sheets URL)'
      );
    }

    const GoogleDoc = new GoogleSpreadsheet(GOOGLE_SHEETS_KEY);
    let GoogleSheet = null;

    GoogleDoc.getInfo((err, info) => {
      if (err) {
        throw new Error(
          'Google Auth failed! Check the permissions on the notebook'
        );
      }
      console.log(`Loaded doc: ${info.title} by ${info.author.email}`);
      GoogleSheet = info.worksheets[0];

      GoogleSheet.getRows(
        {
          offset: 1,
          orderby: 'section',
        },
        (gserr, rows) => {
          if (gserr) {
            throw err;
          } else {
            const final = rows.reduce(
              (acc, row) => {
                if (acc.sections.hasOwnProperty(row.section)) {
                  acc.sections[row.section].articles.push(row);
                } else {
                  acc.sections[row.section] = {
                    header: row.section,
                    articles: [row],
                  };
                }
                return acc;
              },
              { sections: {} }
            );
            resolve(final);
          }
        }
      );
    });
  });
}
