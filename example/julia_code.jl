BIT_WIDTH_CNT = 48;

json_text = """
{
    "id": "count block diagram",
    "children": [
        {
            "id": "count",
            "inPorts": [
                "i_clk",
                "i_sync_rst",
                "i_clr_cnt",
                "s_axi4_lite"
            ],
            "outPorts": [
                {"id": "o_cnt", "rank": [$BIT_WIDTH_CNT]}
            ],
            "children": [
                {
                    "id": "csr",
                    "inPorts": [
                        "i_clk",
                        "i_sync_rst",
                        "s_axi4_lite",
                        "i_cnt"
                    ],
                    "outPorts": [
                        "o_clr_cnt"
                    ]
                },
                {
                    "id": "core",
                    "inPorts": [
                        "i_clk",
                        "i_sync_rst",
                        "i_clr_cnt"
                    ],
                    "outPorts": [
                        {"id": "o_cnt", "rank": [$BIT_WIDTH_CNT]}
                    ]
                },
                {
                    "id": "or",
                    "inPorts": [
                        "i_a",
                        "i_b"
                    ],
                    "outPorts": [
                        "o"
                    ]
                }
            ],
            "edges": [
                {"route": ["count.i_clk", "csr.i_clk"]},
                {"route": ["count.i_sync_rst", "csr.i_sync_rst"]},
                {"route": ["count.s_axi4_lite", "csr.s_axi4_lite"], "bus": 1},
                {"route": ["count.i_clk", "core.i_clk"]},
                {"route": ["count.i_sync_rst", "core.i_sync_rst"]},
                {"route": ["count.i_clr_cnt", "or.i_a"]},
                {"route": ["core.o_cnt", "count.o_cnt"], "bus": 1},

                {"route": ["csr.o_clr_cnt", "or.i_b"]},
                {"route": ["or.o", "core.i_clr_cnt"]},
                {"route": ["count.i_clr_cnt", "or.i_a"]},
                {"route": ["core.o_cnt", "csr.i_cnt"], "bus": 1}
            ]
        }
    ]
}
"""
println(json_text)
