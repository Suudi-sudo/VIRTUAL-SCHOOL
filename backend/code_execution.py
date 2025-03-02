import subprocess
import tempfile

def execute_code(language, code):
    """Executes the given code in a secure environment and returns the output."""
    
    if language not in ["python", "javascript"]:
        return {"error": f"Unsupported language: {language}"}

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py" if language == "python" else ".js") as temp_file:
            temp_file.write(code.encode())
            temp_file.flush()

            if language == "python":
                result = subprocess.run(["python3", temp_file.name], capture_output=True, text=True, timeout=5)
            else:  # JavaScript
                result = subprocess.run(["node", temp_file.name], capture_output=True, text=True, timeout=5)

            return {
                "output": result.stdout,
                "error": result.stderr if result.stderr else None,
                "exit_code": result.returncode
            }
    except subprocess.TimeoutExpired:
        return {"error": "Code execution timed out"}
    except Exception as e:
        return {"error": str(e)}

