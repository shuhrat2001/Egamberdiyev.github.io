<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Time Value of Money Calculator</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.5.0/mammoth.browser.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f0f2f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
        }
        .section {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e1e1e1;
            margin-bottom: 20px;
        }
        textarea {
            width: 100%;
            height: 100px;
            padding: 8px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
            resize: vertical;
        }
        .dropzone {
            border: 2px dashed #ccc;
            border-radius: 4px;
            padding: 20px;
            text-align: center;
            margin-bottom: 15px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .dropzone:hover {
            background-color: #f0f0f0;
        }
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
            margin-right: 10px;
        }
        button:hover {
            background-color: #2980b9;
        }
        #result-section {
            display: none;
        }
        .result-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .result-label {
            color: #7f8c8d;
            font-size: 14px;
        }
        pre {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 14px;
        }
        .error-message {
            background-color: #ffecec;
            color: #e74c3c;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #f5c6cb;
            margin-bottom: 15px;
        }
        .highlighted {
            background-color: #dff0d8;
            padding: 2px 5px;
            border-radius: 3px;
            font-weight: bold;
        }
        .extracted-info {
            margin-top: 15px;
            padding: 10px;
            background-color: #eaf2f8;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Time Value of Money Calculator</h1>
        
        <!-- Problem Input Section -->
        <div class="section">
            <h2>Enter Your Finance Problem</h2>
            <textarea id="problem-input" placeholder="Example: You put $12,000 in your bank account that pays 5% annual interest. What is the future value of this account at the end of the 14th year?"></textarea>
            
            <h3>Upload Resources</h3>
            <div class="upload-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div id="interest-factors-dropzone" class="dropzone">
                    <p>Interest Factors (Excel)</p>
                    <small>Drop Excel file here, or click to select</small>
                    <input type="file" id="interest-factors-input" accept=".xlsx,.xls" style="display: none;">
                    <div id="interest-factors-success" style="color: #27ae60; display: none;"></div>
                </div>
                
                <div id="formulas-dropzone" class="dropzone">
                    <p>Formulas File</p>
                    <small>Drop Word or text file here, or click to select</small>
                    <input type="file" id="formulas-input" accept=".docx,.doc,.txt,.csv" style="display: none;">
                    <div id="formulas-success" style="color: #27ae60; display: none;"></div>
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <button id="solve-btn">Solve Problem</button>
                <button id="clear-btn">Clear</button>
            </div>
        </div>
        
        <!-- Results Section -->
        <div id="result-section" class="section">
            <h2>Solution</h2>
            
            <div id="error-message" class="error-message" style="display: none;"></div>
            
            <div id="extracted-info" class="extracted-info" style="display: none;">
                <h3>I understood your problem as:</h3>
                <div id="extracted-content"></div>
            </div>
            
            <div id="result-container" style="margin-top: 20px;">
                <div class="result-label">Answer:</div>
                <div id="result-value" class="result-value"></div>
            </div>
            
            <div id="calculation-steps" style="margin-top: 20px;">
                <h3>Calculation Steps:</h3>
                <pre id="steps-content"></pre>
            </div>
        </div>
    </div>

    <script>
        // DOM Elements
        const problemInput = document.getElementById('problem-input');
        const interestFactorsDropzone = document.getElementById('interest-factors-dropzone');
        const interestFactorsInput = document.getElementById('interest-factors-input');
        const interestFactorsSuccess = document.getElementById('interest-factors-success');
        const formulasDropzone = document.getElementById('formulas-dropzone');
        const formulasInput = document.getElementById('formulas-input');
        const formulasSuccess = document.getElementById('formulas-success');
        const solveBtn = document.getElementById('solve-btn');
        const clearBtn = document.getElementById('clear-btn');
        const resultSection = document.getElementById('result-section');
        const errorMessage = document.getElementById('error-message');
        const extractedInfo = document.getElementById('extracted-info');
        const extractedContent = document.getElementById('extracted-content');
        const resultValue = document.getElementById('result-value');
        const stepsContent = document.getElementById('steps-content');
        
        // Global variables
        let interestFactors = null;
        let formulas = null;
        
        // Event listeners
        // Interest factors event listeners
        interestFactorsDropzone.addEventListener('click', () => {
            interestFactorsInput.click();
        });
        
        interestFactorsDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            interestFactorsDropzone.style.backgroundColor = '#f0f0f0';
        });
        
        interestFactorsDropzone.addEventListener('dragleave', () => {
            interestFactorsDropzone.style.backgroundColor = '';
        });
        
        interestFactorsDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            interestFactorsDropzone.style.backgroundColor = '';
            if (e.dataTransfer.files.length) {
                handleInterestFactorsFile(e.dataTransfer.files[0]);
            }
        });
        
        interestFactorsInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleInterestFactorsFile(e.target.files[0]);
            }
        });
        
        // Formulas file event listeners
        formulasDropzone.addEventListener('click', () => {
            formulasInput.click();
        });
        
        formulasDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            formulasDropzone.style.backgroundColor = '#f0f0f0';
        });
        
        formulasDropzone.addEventListener('dragleave', () => {
            formulasDropzone.style.backgroundColor = '';
        });
        
        formulasDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            formulasDropzone.style.backgroundColor = '';
            if (e.dataTransfer.files.length) {
                handleFormulasFile(e.dataTransfer.files[0]);
            }
        });
        
        formulasInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFormulasFile(e.target.files[0]);
            }
        });
        
        solveBtn.addEventListener('click', solveProblem);
        clearBtn.addEventListener('click', clearAll);
        
        // Function to handle interest factors file
        function handleInterestFactorsFile(file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Assume the first sheet has our interest factors
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // Convert to JSON
                    interestFactors = XLSX.utils.sheet_to_json(worksheet);
                    
                    interestFactorsSuccess.textContent = `✓ Interest factors loaded (${interestFactors.length} entries)`;
                    interestFactorsSuccess.style.display = 'block';
                    
                    hideError();
                } catch (err) {
                    showError('Error parsing Excel file: ' + err.message);
                }
            };
            
            reader.onerror = () => {
                showError('Error reading the file');
            };
            
            reader.readAsArrayBuffer(file);
        }
        
        // Function to solve the problem
        function solveProblem() {
            const problem = problemInput.value.trim();
            
            if (!problem) {
                showError('Please enter a finance problem to solve.');
                return;
            }
            
            // Reset any previous results
            hideError();
            resultSection.style.display = 'block';
            
            try {
                // Extract information from the problem text
                const extractedData = extractProblemData(problem);
                
                if (!extractedData) {
                    showError('Could not understand the problem. Please try rephrasing or provide more details.');
                    return;
                }
                
                // Display the extracted information
                displayExtractedInfo(extractedData);
                
                // Calculate the result
                calculateAndDisplayResult(extractedData);
                
            } catch (err) {
                showError('Error solving the problem: ' + err.message);
            }
        }
        
        // Function to extract problem data from text
        function extractProblemData(problemText) {
            // Convert to lowercase for easier matching
            const lowerText = problemText.toLowerCase();
            
            // Initialize variables to store extracted values
            let amount = null;
            let rate = null;
            let periods = null;
            let problemType = null;
            
            // Extract the dollar amount - look for patterns like $1,000 or 1,000 dollars
            const amountRegex = /\$([0-9,]+(\.[0-9]+)?)|([0-9,]+(\.[0-9]+)?) dollars/g;
            const amountMatches = [...lowerText.matchAll(amountRegex)];
            
            if (amountMatches.length > 0) {
                // Take the first match and clean it
                let amountStr = amountMatches[0][1] || amountMatches[0][3];
                amount = parseFloat(amountStr.replace(/,/g, ''));
            }
            
            // Extract the interest rate - look for patterns like 5% or 5 percent
            const rateRegex = /([0-9]+(\.[0-9]+)?)( ?%|( ?percent))/g;
            const rateMatches = [...lowerText.matchAll(rateRegex)];
            
            if (rateMatches.length > 0) {
                rate = parseFloat(rateMatches[0][1]);
            }
            
            // Extract the number of periods (years, months, etc.)
            const periodsRegex = /([0-9]+)(?:st|nd|rd|th)? (years?|months?)/gi;
            const periodsMatches = [...lowerText.matchAll(periodsRegex)];
            
            if (periodsMatches.length > 0) {
                periods = parseInt(periodsMatches[0][1]);
                
                // Adjust periods if needed (e.g., convert months to years)
                if (periodsMatches[0][2].toLowerCase().startsWith('month')) {
                    periods = periods / 12;
                }
            }
            
            // Determine the problem type
            if (lowerText.includes('future value') || lowerText.includes('worth') || 
                (lowerText.includes('what') && lowerText.includes('end') && !lowerText.includes('payment'))) {
                problemType = 'fv';
            } else if (lowerText.includes('present value') || lowerText.includes('deposit today') || 
                      (lowerText.includes('what') && lowerText.includes('now'))) {
                problemType = 'pv';
            } else if (lowerText.includes('payment') || lowerText.includes('pmt') || 
                      lowerText.includes('monthly') || lowerText.includes('annually')) {
                problemType = 'pmt';
            } else if ((lowerText.includes('how many') || lowerText.includes('how long')) && 
                      (lowerText.includes('years') || lowerText.includes('months'))) {
                problemType = 'n';
            } else if (lowerText.includes('interest rate') && lowerText.includes('what')) {
                problemType = 'r';
            } else if (amount && rate && periods) {
                // If we have all three values but can't determine the type, assume future value
                problemType = 'fv';
            }
            
            // If we couldn't extract the critical information, return null
            if (!amount || !rate || !periods || !problemType) {
                return null;
            }
            
            return {
                amount: amount,
                rate: rate / 100, // Convert percentage to decimal
                periods: periods,
                problemType: problemType
            };
        }
        
        // Function to display extracted information
        function displayExtractedInfo(data) {
            let content = '';
            
            // Format based on problem type
            if (data.problemType === 'fv') {
                content = `I need to find the <span class="highlighted">Future Value</span> of <span class="highlighted">$${data.amount.toLocaleString()}</span> invested at <span class="highlighted">${(data.rate * 100).toFixed(2)}%</span> interest for <span class="highlighted">${data.periods}</span> years.`;
            } else if (data.problemType === 'pv') {
                content = `I need to find the <span class="highlighted">Present Value</span> that will grow to <span class="highlighted">$${data.amount.toLocaleString()}</span> at <span class="highlighted">${(data.rate * 100).toFixed(2)}%</span> interest after <span class="highlighted">${data.periods}</span> years.`;
            } else if (data.problemType === 'pmt') {
                content = `I need to find the <span class="highlighted">Payment</span> amount for a present value of <span class="highlighted">$${data.amount.toLocaleString()}</span> at <span class="highlighted">${(data.rate * 100).toFixed(2)}%</span> interest for <span class="highlighted">${data.periods}</span> years.`;
            } else if (data.problemType === 'n') {
                content = `I need to find <span class="highlighted">how many years</span> it takes for <span class="highlighted">$${data.amount.toLocaleString()}</span> to grow at <span class="highlighted">${(data.rate * 100).toFixed(2)}%</span> interest for a total of <span class="highlighted">${data.periods}</span> periods.`;
            } else if (data.problemType === 'r') {
                content = `I need to find the <span class="highlighted">interest rate</span> needed for <span class="highlighted">$${data.amount.toLocaleString()}</span> to grow over <span class="highlighted">${data.periods}</span> years.`;
            }
            
            extractedContent.innerHTML = content;
            extractedInfo.style.display = 'block';
        }
        
        // Function to calculate and display the result
        function calculateAndDisplayResult(data) {
            let result = 0;
            let steps = '';
            
            // Calculation logic based on problem type
            if (data.problemType === 'fv') {
                // Future Value calculation: FV = PV * (1 + r)^n
                result = data.amount * Math.pow(1 + data.rate, data.periods);
                
                steps = `Future Value = Present Value × (1 + Interest Rate)^Time\n`;
                steps += `FV = $${data.amount.toLocaleString()} × (1 + ${(data.rate).toFixed(4)})^${data.periods}\n`;
                steps += `FV = $${data.amount.toLocaleString()} × ${Math.pow(1 + data.rate, data.periods).toFixed(4)}\n`;
                steps += `FV = $${result.toFixed(2)}`;
                
            } else if (data.problemType === 'pv') {
                // Present Value calculation: PV = FV / (1 + r)^n
                result = data.amount / Math.pow(1 + data.rate, data.periods);
                
                steps = `Present Value = Future Value / (1 + Interest Rate)^Time\n`;
                steps += `PV = $${data.amount.toLocaleString()} / (1 + ${(data.rate).toFixed(4)})^${data.periods}\n`;
                steps += `PV = $${data.amount.toLocaleString()} / ${Math.pow(1 + data.rate, data.periods).toFixed(4)}\n`;
                steps += `PV = $${result.toFixed(2)}`;
                
            } else if (data.problemType === 'pmt') {
                // Payment calculation for annuity: PMT = PV * r * (1 + r)^n / ((1 + r)^n - 1)
                result = data.amount * data.rate * Math.pow(1 + data.rate, data.periods) / (Math.pow(1 + data.rate, data.periods) - 1);
                
                steps = `Payment = PV × r × (1 + r)^n / ((1 + r)^n - 1)\n`;
                steps += `PMT = $${data.amount.toLocaleString()} × ${(data.rate).toFixed(4)} × (1 + ${(data.rate).toFixed(4)})^${data.periods} / ((1 + ${(data.rate).toFixed(4)})^${data.periods} - 1)\n`;
                steps += `PMT = $${data.amount.toLocaleString()} × ${(data.rate).toFixed(4)} × ${Math.pow(1 + data.rate, data.periods).toFixed(4)} / ${(Math.pow(1 + data.rate, data.periods) - 1).toFixed(4)}\n`;
                steps += `PMT = $${result.toFixed(2)}`;
                
            } else if (data.problemType === 'n') {
                // Number of periods calculation: n = ln(FV/PV) / ln(1+r)
                result = Math.log(data.periods / data.amount) / Math.log(1 + data.rate);
                
                steps = `Number of periods = ln(FV/PV) / ln(1+r)\n`;
                steps += `n = ln(${data.periods} / ${data.amount}) / ln(1 + ${(data.rate).toFixed(4)})\n`;
                steps += `n = ln(${(data.periods / data.amount).toFixed(4)}) / ln(${(1 + data.rate).toFixed(4)})\n`;
                steps += `n = ${Math.log(data.periods / data.amount).toFixed(4)} / ${Math.log(1 + data.rate).toFixed(4)}\n`;
                steps += `n = ${result.toFixed(2)} years`;
                
            } else if (data.problemType === 'r') {
                // Rate calculation: r = (FV/PV)^(1/n) - 1
                result = Math.pow(data.periods / data.amount, 1 / data.periods) - 1;
                result = result * 100; // Convert back to percentage
                
                steps = `Interest Rate = (FV/PV)^(1/n) - 1\n`;
                steps += `r = (${data.periods} / ${data.amount})^(1/${data.periods}) - 1\n`;
                steps += `r = (${(data.periods / data.amount).toFixed(4)})^(${(1 / data.periods).toFixed(4)}) - 1\n`;
                steps += `r = ${(Math.pow(data.periods / data.amount, 1 / data.periods)).toFixed(4)} - 1\n`;
                steps += `r = ${(result / 100).toFixed(4)} = ${result.toFixed(2)}%`;
            }
            
            // Display the result
            resultValue.textContent = data.problemType === 'r' ? 
                `${result.toFixed(2)}%` : 
                `$${result.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                
            stepsContent.textContent = steps;
        }
        
        // Function to handle formulas file
        function handleFormulasFile(file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    // Check if it's a Word document
                    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                        const arrayBuffer = e.target.result;
                        
                        // Use mammoth.js to extract text from Word document
                        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                            .then(function(result) {
                                formulas = result.value; // The raw text content
                                displayFormulas(formulas);
                            })
                            .catch(function(error) {
                                showError('Error extracting text from Word file: ' + error.message);
                            });
                    } else {
                        // For text files
                        formulas = e.target.result;
                        displayFormulas(formulas);
                    }
                } catch (err) {
                    showError('Error parsing formulas file: ' + err.message);
                }
            };
            
            reader.onerror = () => {
                showError('Error reading the file');
            };
            
            // Read as array buffer for Word documents, text for other files
            if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        }
        
        // Function to display loaded formulas
        function displayFormulas(content) {
            formulasSuccess.textContent = '✓ Formulas file loaded';
            formulasSuccess.style.display = 'block';
            
            // Create or update the formulas section
            if (!document.getElementById('formulas-section')) {
                const formulasSection = document.createElement('div');
                formulasSection.id = 'formulas-section';
                formulasSection.className = 'section';
                formulasSection.style.marginTop = '20px';
                
                const formulasTitle = document.createElement('h2');
                formulasTitle.textContent = 'Loaded Formulas';
                
                const formulasContent = document.createElement('pre');
                formulasContent.id = 'formulas-content';
                formulasContent.style.backgroundColor = '#f0f0f0';
                formulasContent.style.padding = '10px';
                formulasContent.style.borderRadius = '4px';
                formulasContent.style.maxHeight = '200px';
                formulasContent.style.overflowY = 'auto';
                formulasContent.textContent = content;
                
                formulasSection.appendChild(formulasTitle);
                formulasSection.appendChild(formulasContent);
                
                document.querySelector('.container').appendChild(formulasSection);
            } else {
                document.getElementById('formulas-content').textContent = content;
                document.getElementById('formulas-section').style.display = 'block';
            }
            
            hideError();
        }
        
        // Function to clear all inputs and results
        function clearAll() {
            problemInput.value = '';
            resultSection.style.display = 'none';
            errorMessage.style.display = 'none';
            extractedInfo.style.display = 'none';
            
            // Hide the formulas section if it exists
            const formulasSection = document.getElementById('formulas-section');
            if (formulasSection) {
                formulasSection.style.display = 'none';
            }
            
            // Reset the success messages
            interestFactorsSuccess.style.display = 'none';
            formulasSuccess.style.display = 'none';
        }
        
        // Helper function to show error messages
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        
        // Function to calculate using formulas from the uploaded file
        function calculateUsingFormulas(data) {
            // Parse the formulas file to find the appropriate formula
            const formulaLines = formulas.split('\n');
            let formulaFound = false;
            let result = 0;
            let steps = '';
            
            try {
                // Look for the formula matching our problem type
                const problemType = data.problemType.toUpperCase();
                
                for (const line of formulaLines) {
                    // Simple parsing - look for lines that start with the problem type
                    if (line.trim().toUpperCase().startsWith(problemType + ':') || 
                        line.trim().toUpperCase().startsWith(problemType + ' =')) {
                        
                        // Extract the formula text
                        const formulaText = line.trim().substring(line.indexOf(':') + 1 || line.indexOf('=') + 1).trim();
                        
                        steps = `Using formula from file: ${line.trim()}\n\n`;
                        
                        // For demonstration, we'll still use our built-in calculations
                        // In a real implementation, you would parse and evaluate the formula
                        if (data.problemType === 'fv') {
                            result = data.amount * Math.pow(1 + data.rate, data.periods);
                            steps += `Substituting values:\n`;
                            steps += `FV = ${data.amount.toLocaleString()} × (1 + ${(data.rate).toFixed(4)})^${data.periods}\n`;
                            steps += `FV = ${data.amount.toLocaleString()} × ${Math.pow(1 + data.rate, data.periods).toFixed(4)}\n`;
                            steps += `FV = ${result.toFixed(2)}`;
                        } else if (data.problemType === 'pv') {
                            result = data.amount / Math.pow(1 + data.rate, data.periods);
                            steps += `Substituting values:\n`;
                            steps += `PV = ${data.amount.toLocaleString()} / (1 + ${(data.rate).toFixed(4)})^${data.periods}\n`;
                            steps += `PV = ${data.amount.toLocaleString()} / ${Math.pow(1 + data.rate, data.periods).toFixed(4)}\n`;
                            steps += `PV = ${result.toFixed(2)}`;
                        } else if (data.problemType === 'pmt') {
                            result = data.amount * data.rate * Math.pow(1 + data.rate, data.periods) / (Math.pow(1 + data.rate, data.periods) - 1);
                            steps += `Substituting values:\n`;
                            steps += `PMT = ${data.amount.toLocaleString()} × ${(data.rate).toFixed(4)} × ${Math.pow(1 + data.rate, data.periods).toFixed(4)} / ${(Math.pow(1 + data.rate, data.periods) - 1).toFixed(4)}\n`;
                            steps += `PMT = ${result.toFixed(2)}`;
                        } else if (data.problemType === 'n') {
                            result = Math.log(data.periods / data.amount) / Math.log(1 + data.rate);
                            steps += `Substituting values:\n`;
                            steps += `n = ln(${data.periods} / ${data.amount}) / ln(1 + ${(data.rate).toFixed(4)})\n`;
                            steps += `n = ${result.toFixed(2)} years`;
                        } else if (data.problemType === 'r') {
                            result = Math.pow(data.periods / data.amount, 1 / data.periods) - 1;
                            result = result * 100; // Convert to percentage
                            steps += `Substituting values:\n`;
                            steps += `r = (${data.periods} / ${data.amount})^(1/${data.periods}) - 1\n`;
                            steps += `r = ${(result / 100).toFixed(4)} = ${result.toFixed(2)}%`;
                        }
                        
                        formulaFound = true;
                        break;
                    }
                }
                
                if (!formulaFound) {
                    // If no formula is found, fall back to built-in calculation
                    calculateAndDisplayResult(data);
                    return;
                }
                
                // Display the result
                resultValue.textContent = data.problemType === 'r' ? 
                    `${result.toFixed(2)}%` : 
                    `${result.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    
                stepsContent.textContent = steps;
                
            } catch (err) {
                showError('Error using formula from file: ' + err.message);
                // Fall back to built-in calculation
                calculateAndDisplayResult(data);
            }
        }
        
        // Helper function to hide error messages
        function hideError() {
            errorMessage.style.display = 'none';
        }
        
        // Initialize with an example problem
        problemInput.value = "You put $12,000 in your bank account that pays 5% annual interest. What is the future value of this account at the end of the 14th year?";
    </script>
</body>
</html>
