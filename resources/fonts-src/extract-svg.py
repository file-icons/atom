#!/usr/bin/env python
# -*- coding: utf-8 -*-
import fontforge
import getopt
import sys
import re


font_file   = ""
save_to     = ""


# Get options from command-line
try:
	options, args = getopt.getopt(sys.argv[1:], "f:s:g", ["font-file=", "save-to="])
except getopt.GetoptError:
	usage()
	sys.exit(1)


# Store their values
for key, value in options:
	if   key in ("-f", "--font-file"):    font_file   = value
	elif key in ("-s", "--save-to"):      save_to     = value


# Precompile a regular expression for stripping a leading "0x" from a string
strip_0x = re.compile(r"^0x")


# Open the subject file in FontForge
f = fontforge.open(font_file)


# Loop through each glyph stored in the font
for g in f:
	codepoint = f[g].unicode
	
	# If the glyph's assigned a valid codepoint, extract it as an SVG
	if(codepoint > 0):
		hexed = strip_0x.sub("", hex(codepoint))
		f[g].export(save_to + "/" + hexed.upper() + ".svg")

f.close()
