@echo off
SETLOCAL

:: Verify Node.js is installed and reachable from the user's %PATH%
call :which node
@if "%_path%"=="" (
	echo This program requires Node.js to run. >&2
	echo Download from https://nodejs.org >&2
	exit /b 2
)

:: Verify the installed version of Node is v7.6.0 or higher
node --version | findstr /R "^[vV]*[0-6]\. ^[vV]*7\.[0-5]*\." >NUL && (
	echo This program requires Node.js v7.6.0 or later.
	exit /b 2
)

:: Program entry point
node "%~dp0\compile" %*

:: Exit program. Subroutine definitions follow the next line
goto :eof


:: Set %_path% to location of named program: "call :which foo"
:which
set _path=
@for %%e in (%PATHEXT%) do @for %%i in (%1%%e) do @if not "%%~$PATH:i"=="" set _path=%%~$PATH:i
exit /b
