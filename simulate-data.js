const apiUrl = 'https://org214c530e.api.crm.dynamics.com/api/data/v9.2/cre6c_nrc_permits_tables';
require('dotenv').config();
const accessToken = process.env.ACCESS_TOKEN;

async function createPermit(permitData) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify(permitData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }

    console.log('Permit created successfully!');
  } catch (error) {
    console.error('Failed to create permit:', error);
  }
}

async function createTestPermits(numberOfPermits) {
  for (let i = 1; i <= numberOfPermits; i++) {
    const testData = {
      "cre6c_applicantname": `Test Applicant ${i}`,
      "cre6c_applicantemail": `email+${i}@email.com`,
      "cre6c_applicantphone": `123-${i+10}-${i+1100}`,
      "cre6c_primarycontactname": `Test pry ${i}`,
      "cre6c_primarycontactphone": `321-${i+11}-${i+2200}`,
      "cre6c_primarycontactemail": `test_email+${i}@email.us`,
      "createdon": `testuser${i}@example.com`,
      "cre6c_projectedstartdate": "2026-01-01T00:00:00Z",
      "cre6c_projectedenddate": "2026-12-31T00:00:00Z",
      "cre6c_organizationstructure": `This is a test project description for application number ${i}.`,
      "cre6c_location": `${1000+i} parkwood ct, Alexandria, Virginia, USA`,
      "cre6c_submissionby": 'gavrieljonah@gmail.com',
      "cre6c_reactormodel": `Industry reactorX`,
      "cre6c_plantname": `Duke-Nukem`,
      "cre6c_plantdesign": 564980001,
      "cre6c_operatinghistory": `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from ${i+45} BC, making it over 200${i} years old.`,
      "cre6c_longitude":`99.00000`,
      "cre6c_latitude":`-12.21211`,
      "cre6c_experiencequalifications": `The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form`

    };

    console.log(`Creating permit ${i} of ${numberOfPermits}...`);
    await createPermit(testData);

    // Optional: Add a delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log('All test permits have been submitted.');
}

// Call the main function to start the process
const recordsToCreate = 25; // 👈 Change this number to 25
createTestPermits(recordsToCreate);