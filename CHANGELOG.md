# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Changed:
  - Updated elkjs to v0.9.2.

## [0.2.0] - 2024-03-13

- Added:
  - C-style comment and string interpolation
  - show dimension in edge label with `rank` option (e.g.: `rank: [2,8]` automatically appends `[1:0][7:0]` to the label)
  - edge bus visual width override by `edge_bus_visual_width` argument of `hdelk.layout` function (e.g. `hdelk.layout(graph, "diagram", edge_bus_visual_width=3)`).

## [0.1.0] - 2024-03-11

initial release
