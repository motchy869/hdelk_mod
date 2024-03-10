#!/usr/bin/env python3

import os
import sys
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
# CONSTANTS_FILE_PATH = os.path.join(SCRIPT_DIR, 'constants.jl')
# JULIA_CODE_FILE_PATH = os.path.join(SCRIPT_DIR, 'julia_code.jl')

# ---------- Get the input file path. ----------
input_file_path = ''
if len(sys.argv) > 1:
    input_file_path = sys.argv[1]
else:
    print('Input file path not provided.', file=sys.stderr)
    sys.exit(1)

if not os.path.exists(input_file_path):
    print('Input file does not exist.', file=sys.stderr)
    sys.exit(1)

input_file_extension = os.path.splitext(input_file_path)[1]
if input_file_extension != '.jsonc':
    print('Invalid file extension. Expected ".jsonc".', file=sys.stderr)
    sys.exit(1)

input_file_dir = os.path.dirname(input_file_path)
constants_file_path = os.path.join(input_file_dir, 'constants.jl')
julia_code_path = os.path.join(input_file_dir, 'julia_code.jl')
# --------------------

# Prepare the code to be executed by Julia.
with open(constants_file_path, 'r') as file:
    julia_code = file.read()
julia_code += '\njson_text = """'
sed_command = "sed -e '/^\s*\/\*.*\*\/$/d' {}".format(input_file_path)
julia_code += subprocess.check_output(sed_command, shell=True).decode('utf-8')
julia_code += '"""\n'
julia_code += 'println(json_text)\n'
with open(julia_code_path, 'w') as file:
    file.write(julia_code)

# ---------- Generate the output file. ----------
output_file_path = os.path.splitext(input_file_path)[0] + '.html'

html_text = '''
<!DOCTYPE html>
<html>
<body>

<script src="js/elk.bundled.js"></script>
<script src="js/svg.min.js"></script>
<script src="js/hdelk.js"></script>

<div id="diagram"></div>

<script type="text/javascript">
var diagram =
'''

html_text += subprocess.check_output(f'julia {julia_code_path}', shell=True, executable='/bin/bash').decode('utf-8')
html_text += '''
hdelk.layout(diagram, "diagram");
</script>

</body>
</html>
'''

with open(output_file_path, 'w') as file:
    file.write(html_text)
# --------------------
