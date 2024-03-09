# HDElk mod

![banner](images/banner_2.png)

This is a fork of [HDElk](https://github.com/davidthings/hdelk).
Some features are added:

## 1. New features

1. arrow-head at edge termination
2. Bi-directional edge with `bidir` option (reverse is not supported)
3. multi-line node and edge label
4. show bit-width in port label with `rank` option (e.g.: `rank: [2,8]` automatically appends `[1:0][7:0]` to the label)
5. You can specify `thoroughness` layout algorithm parameter of ELK. `hdelk.layout(graph, "title", [thoroughness]);`
6. You can fix port orders (do not sort ports in layout calculation) per node.
7. new colors

![new colors](images/new_colors.png)

## 2. modified files

* `js/hdelk.js`
