@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script
@REM ----------------------------------------------------------------------------
@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL

SET ERROR_CODE=0

if not "%JAVA_HOME%" == "" goto OkJHome

for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
goto checkJCmd

:OkJHome
set "JAVACMD=%JAVA_HOME%\bin\java.exe"

:checkJCmd
if exist "%JAVACMD%" goto checkWrapper

echo Error: JAVA_HOME not found in your environment. >&2
goto error

:checkWrapper
set "DIRNAME=%~dp0"
if "%DIRNAME%" == "" set "DIRNAME=."
if "%DIRNAME:~-1%"=="\" set "DIRNAME=%DIRNAME:~0,-1%"
set "WRAPPER_JAR=%DIRNAME%\.mvn\wrapper\maven-wrapper.jar"

if exist "%WRAPPER_JAR%" goto runWrapper

echo Error: Could not find %WRAPPER_JAR% >&2
goto error

:runWrapper
"%JAVACMD%" -Dmaven.multiModuleProjectDirectory="%DIRNAME%" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%
