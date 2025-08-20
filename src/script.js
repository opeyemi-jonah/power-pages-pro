$(document).ready(function() {
  let currentStep = 1;
  const totalSteps = $(".form-step").length;
  let recordId = null; 

  function showStep(step) {
    $(".form-step").removeClass("active");
    $('.form-step[data-step="'+step+'"]').addClass("active");
    $("#prevBtn").toggle(step > 1);
    $("#nextBtn").toggle(step < totalSteps);
    $("#submitBtn").toggle(step === totalSteps);
  }

  function validateStep(step) {
    let isValid = true;
    $(".error").text("");

    if (step === 1) {
      const requiredFields = ["new_applicantname", "new_applicantemail", "new_applicantphone", "new_primarycontactname", "new_primarycontactemail", "new_primarycontactphone"];
      requiredFields.forEach(id => {
        if (!$("#" + id).val().trim()) {
          $("#err_" + id.replace('new_', '')).text("This field is required.");
          isValid = false;
        }
      });
    }

    if (step === 2) {
      if (!$("#new_plantname").val().trim()) {
        $("#err_plantname").text("Plant name is required.");
        isValid = false;
      }
      if (!$("#new_location").val().trim()) {
        $("#err_location").text("Location is required.");
        isValid = false;
      }
      if (!$("#new_plantdesign").val()) {
        $("#err_plantdesign").text("Plant Design is required.");
        isValid = false;
      }
    }

    if (step === 3) {
      if (!$("#new_projectstartdate").val()) {
        $("#err_startdate").text("Start date is required.");
        isValid = false;
      }
      if (!$("#new_projectenddate").val()) {
        $("#err_enddate").text("End date is required.");
        isValid = false;
      }
    }

    if (step === 4) {
      if (!$("#new_financialassurance").val()) {
        $("#err_financialassurance").text("Financial Assurance is required.");
        isValid = false;
      }
    }

    if (step === 6) {
      if (!$("input[name='new_termsaccepted']:checked").val()) {
        $("#err_terms").text("You must accept the terms.");
        isValid = false;
      }
      if (!$("#new_initials").val().trim()) {
        $("#err_initials").text("Initials are required.");
        isValid = false;
      }
    }
    
    return isValid;
  }

  function saveStep(step, callback) {
    let data = {};
    if (step === 1) {
      data.new_applicantname = $("#new_applicantname").val();
      data.new_applicantemail = $("#new_applicantemail").val();
      data.new_applicantphone = $("#new_applicantphone").val();
      data.new_primarycontactname = $("#new_primarycontactname").val();
      data.new_primarycontactemail = $("#new_primarycontactemail").val();
      data.new_primarycontactphone = $("#new_primarycontactphone").val();
      data.new_organizationstructure = $("#new_organizationstructure").val();
    }
    if (step === 2) {
      data.new_plantname = $("#new_plantname").val();
      data.new_location = $("#new_location").val();
      data.new_latitude = $("#new_latitude").val();
      data.new_longitude = $("#new_longitude").val();
      data.new_plantdesign = $("#new_plantdesign").val();
      data.new_rectormodel = $("#new_rectormodel").val();
      data.new_operatinghistory = $("#new_operatinghistory").val();
    }
    if (step === 3) {
      data.new_projectstartdate = $("#new_projectstartdate").val();
      data.new_projectenddate = $("#new_projectenddate").val();
      data.new_modificationdescription = $("#new_modificationdescription").val();
    }
    if (step === 4) {
      data.new_financialassurance = $("#new_financialassurance").val();
      data.new_experiencequalification = $("#new_experiencequalification").val();
    }
    if (step === 6) {
      data.new_termsaccepted = $("input[name='new_termsaccepted']:checked").val();
      data.new_initials = $("#new_initials").val();
    }
    
    // File upload (Step 5) is a separate process
    if (step === 5) {
      const fileInput = document.getElementById("new_uploadfile");
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileName = file.name;
        const fileContent = file;
        const note = {
          "subject": fileName,
          "filename": fileName,
          "documentbody": "", // Will be filled with base64 encoded data
          "isdocument": true
        };
        
        const reader = new FileReader();
        reader.onload = function(event) {
          const base64Data = event.target.result.split(',')[1];
          note.documentbody = base64Data;
          note["objectid_new_projectapplication@odata.bind"] = `/new_projectapplications(${recordId})`;

          webapi.safeAjax({
            type: "POST",
            contentType: "application/json",
            url: "/_api/annotations",
            data: JSON.stringify(note),
            success: function() { callback(true); },
            error: function(xhr) {
              console.log(xhr);
              alert("Error uploading file.");
              callback(false);
            }
          });
        };
        reader.readAsDataURL(file);
      } else {
        callback(true); // No file to upload, proceed
      }
      return;
    }

    if (!recordId && step === 1) {
      // Create record
      webapi.safeAjax({
        type: "POST",
        contentType: "application/json",
        url: "/_api/new_projectapplications",
        data: JSON.stringify(data),
        success: function(data, textStatus, xhr) {
          recordId = xhr.getResponseHeader("entityid");
          callback(true);
        },
        error: function(xhr) {
          console.log(xhr);
          alert("Error creating record.");
          callback(false);
        }
      });
    } else {
      // Update existing record
      webapi.safeAjax({
        type: "PATCH",
        contentType: "application/json",
        url: "/_api/new_projectapplications(" + recordId + ")",
        data: JSON.stringify(data),
        success: function() { callback(true); },
        error: function(xhr) {
          console.log(xhr);
          alert("Error saving step " + step);
          callback(false);
        }
      });
    }
  }

  $("#nextBtn").click(function() {
    if (!validateStep(currentStep)) return;
    
    // For Step 6, just update the confirmation step without an API call
    if (currentStep === 6) {
      updateSummary();
      currentStep++;
      showStep(currentStep);
      return;
    }

    saveStep(currentStep, function(success) {
      if (success && currentStep < totalSteps) {
        if (currentStep === 6) {
          updateSummary();
        }
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  $("#prevBtn").click(function() {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });

  function updateSummary() {
    // Step 1
    $("#confirm_applicantname").text($("#new_applicantname").val());
    $("#confirm_applicantemail").text($("#new_applicantemail").val());
    $("#confirm_applicantphone").text($("#new_applicantphone").val());
    $("#confirm_primarycontactname").text($("#new_primarycontactname").val());
    $("#confirm_primarycontactemail").text($("#new_primarycontactemail").val());
    $("#confirm_primarycontactphone").text($("#new_primarycontactphone").val());
    $("#confirm_organizationstructure").text($("#new_organizationstructure").val());

    // Step 2
    $("#confirm_plantname").text($("#new_plantname").val());
    $("#confirm_location").text($("#new_location").val());
    $("#confirm_latitude").text($("#new_latitude").val());
    $("#confirm_longitude").text($("#new_longitude").val());
    $("#confirm_plantdesign").text($("#new_plantdesign option:selected").text());
    $("#confirm_rectormodel").text($("#new_rectormodel").val());
    $("#confirm_operatinghistory").text($("#new_operatinghistory").val());

    // Step 3
    $("#confirm_projectstartdate").text($("#new_projectstartdate").val());
    $("#confirm_projectenddate").text($("#new_projectenddate").val());
    $("#confirm_modificationdescription").text($("#new_modificationdescription").val());

    // Step 4
    $("#confirm_financialassurance").text($("#new_financialassurance option:selected").text());
    $("#confirm_experiencequalification").text($("#new_experiencequalification").val());

    // Step 6
    $("#confirm_termsaccepted").text($("input[name='new_termsaccepted']:checked").val() === 'yes' ? 'Yes' : 'No');
    $("#confirm_initials").text($("#new_initials").val());
  }

  $("#multiStepForm").submit(function(event) {
    event.preventDefault();
    if (!recordId) {
      alert("Error: No record created.");
      return;
    }
    alert("Project Application submitted successfully! ID: " + recordId);
    $("#multiStepForm")[0].reset();
    recordId = null;
    currentStep = 1;
    showStep(currentStep);
  });

  showStep(currentStep);
});