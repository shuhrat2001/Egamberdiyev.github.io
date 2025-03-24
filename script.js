function submitAssignment(sectionId) {  
    const textarea = document.querySelector(`#${sectionId} textarea`);  
    const content = textarea.value;  
    if (content) {  
        alert(`Submitted Assignment from ${sectionId}: ${content}`);  
        textarea.value = ''; // Clear the textarea after submission  
    } else {  
        alert('Please enter your assignment before submitting.');  
    }  
}
