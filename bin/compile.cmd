@IF EXIST "%~dp0\node.exe" (
	"%~dp0\node.exe" "%~dp0\compile" %*
) ELSE (
	@SETLOCAL
	@SET PATHEXT=%PATHEXT:;.JS;=;%
	node -v >nul || (
		echo This script requires NodeJS to run.
		exit /B
	)
	node "%~dp0\compile" %*
)
