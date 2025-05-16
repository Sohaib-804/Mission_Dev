const axios = require("axios")
const logger = require("./logger")

// Function to evaluate code using Judge0 API
exports.evaluateCode = async (code, language, testCases) => {
  try {
    // Map our language names to Judge0 language IDs
    const languageMap = {
      javascript: 63, // JavaScript (Node.js 12.14.0)
      python: 71, // Python (3.8.1)
      java: 62, // Java (OpenJDK 13.0.1)
      csharp: 51, // C# (Mono 6.6.0.161)
      cpp: 54, // C++ (GCC 9.2.0)
      ruby: 72, // Ruby (2.7.0)
      go: 60, // Go (1.13.5)
      rust: 73, // Rust (1.40.0)
      php: 68, // PHP (7.4.1)
    }

    const languageId = languageMap[language] || 63 // Default to JavaScript if language not found

    // If no test cases are provided, just run the code
    if (!testCases || testCases.length === 0) {
      // Create a submission to Judge0
      const response = await axios.post(
        process.env.JUDGE0_API_URL + "/submissions",
        {
          source_code: code,
          language_id: languageId,
          stdin: "",
          expected_output: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          },
        },
      )

      const token = response.data.token

      // Wait for the submission to be processed
      let result
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

        const statusResponse = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/${token}`, {
          headers: {
            "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          },
        })

        if (statusResponse.data.status.id > 2) {
          // Status > 2 means finished
          result = statusResponse.data
          break
        }

        attempts++
      }

      if (!result) {
        return {
          status: "timeout",
          output: "Evaluation timed out. Please try again.",
        }
      }

      // Map Judge0 status to our status
      let status
      switch (result.status.id) {
        case 3: // Accepted
          status = "success"
          break
        case 4: // Wrong Answer
        case 5: // Time Limit Exceeded
          status = "error"
          break
        case 6: // Compilation Error
          status = "compilation_error"
          break
        default:
          status = "error"
      }

      return {
        status,
        output: result.stdout || result.stderr || result.compile_output || "",
        error: result.stderr || result.compile_output || "",
      }
    } else {
      // Run each test case
      const testResults = []
      let allPassed = true

      for (const testCase of testCases) {
        // Create a submission for this test case
        const testCode = `
          ${code}
          
          // Test case: ${testCase.name}
          ${testCase.testCode}
        `

        const response = await axios.post(
          process.env.JUDGE0_API_URL + "/submissions",
          {
            source_code: testCode,
            language_id: languageId,
            stdin: testCase.input || "",
            expected_output: testCase.expectedOutput || "",
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
            },
          },
        )

        const token = response.data.token

        // Wait for the submission to be processed
        let result
        let attempts = 0
        const maxAttempts = 10

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

          const statusResponse = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/${token}`, {
            headers: {
              "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
            },
          })

          if (statusResponse.data.status.id > 2) {
            // Status > 2 means finished
            result = statusResponse.data
            break
          }

          attempts++
        }

        if (!result) {
          testResults.push({
            name: testCase.name,
            passed: false,
            message: "Test timed out",
          })
          allPassed = false
          continue
        }

        // Check if test passed
        const passed = result.status.id === 3 // 3 = Accepted

        if (!passed) {
          allPassed = false
        }

        testResults.push({
          name: testCase.name,
          passed,
          message: passed ? "" : result.stderr || result.compile_output || "Test failed",
        })
      }

      return {
        status: allPassed ? "success" : "error",
        testResults,
      }
    }
  } catch (err) {
    logger.error("Error evaluating code:", err)
    return {
      status: "error",
      output: "An error occurred during code evaluation.",
      error: err.message,
    }
  }
}

// Fallback implementation if Judge0 is not available
exports.evaluateCodeFallback = async (code, language, testCases) => {
  try {
    // This is a simplified fallback that doesn't actually run the code
    // It just checks if the code contains certain keywords from the test cases

    if (!testCases || testCases.length === 0) {
      return {
        status: "success",
        output: "Code submitted successfully (fallback mode)",
      }
    }

    const testResults = []
    let allPassed = true

    for (const testCase of testCases) {
      // Simple check: does the code contain keywords from the test case?
      const keywords = testCase.keywords || []
      const passed = keywords.every((keyword) => code.includes(keyword))

      if (!passed) {
        allPassed = false
      }

      testResults.push({
        name: testCase.name,
        passed,
        message: passed ? "" : "Test failed (fallback mode)",
      })
    }

    return {
      status: allPassed ? "success" : "error",
      testResults,
    }
  } catch (err) {
    logger.error("Error in fallback code evaluation:", err)
    return {
      status: "error",
      output: "An error occurred during fallback code evaluation.",
      error: err.message,
    }
  }
}
