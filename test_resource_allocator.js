var assert = require('assert');
var expect = require('chai').expect;

var ResourceAllocator = require('./resource_allocator');

describe("Resource Allocator Test Cases", function () {
    it("should output valid case for number of CPUs", function () {
        var result = ResourceAllocator.get_costs({
            "us-east": { "large": 0.12, "xlarge": 0.23, "2xlarge": 0.45, "4xlarge": 0.774, "8xlarge": 1.4, "10xlarge": 2.82 }, "us-west": {
                "large": 0.14,
                "2xlarge": 0.413,
                "4xlarge": 0.89,
                "8xlarge": 1.3,
                "10xlarge": 2.97
            }
        }, 1, 15)

        var expected_result = [
            {
                "region": "us-west",
                "servers": [
                    [
                        "8xlarge",
                        1
                    ]
                ],
                "total_cost": "$1.3"
            },
            {
                "region": "us-east",
                "servers": [
                    [
                        "8xlarge",
                        1
                    ]
                ],
                "total_cost": "$1.4"
            }
        ];
        expect(result).to.eql(expected_result);
    });

    it("should output valid case for price", function () {
        var result = ResourceAllocator.get_costs({
            "us-east": { "large": 0.12, "xlarge": 0.23, "2xlarge": 0.45, "4xlarge": 0.774, "8xlarge": 1.4, "10xlarge": 2.82 }, "us-west": {
                "large": 0.14,
                "2xlarge": 0.413,
                "4xlarge": 0.89,
                "8xlarge": 1.3,
                "10xlarge": 2.97
            }
        }, 1, null, 10)

        var expected_result = [
            {
                "region": "us-west",
                "servers": [
                    [
                        "large",
                        1
                    ],
                    [
                        "4xlarge",
                        1
                    ],
                    [
                        "10xlarge",
                        3
                    ]
                ],
                "total_cost": "$9.940000000000001"
            },
            {
                "region": "us-east",
                "servers": [
                    [
                        "large",
                        1
                    ],
                    [
                        "8xlarge",
                        1
                    ],
                    [
                        "10xlarge",
                        3
                    ]
                ],
                "total_cost": "$9.979999999999999"
            }
        ]
        expect(result).to.eql(expected_result);

    })

    it("should output valid case for number of CPUs & price", function () {
        var result = ResourceAllocator.get_costs({
            "us-east": { "large": 0.12, "xlarge": 0.23, "2xlarge": 0.45, "4xlarge": 0.774, "8xlarge": 1.4, "10xlarge": 2.82 }, "us-west": {
                "large": 0.14,
                "2xlarge": 0.413,
                "4xlarge": 0.89,
                "8xlarge": 1.3,
                "10xlarge": 2.97
            }
        }, 1, 40, 10);

        var expected_result = [
            {
                "region": "us-east",
                "servers": [
                    [
                        "4xlarge",
                        1
                    ],
                    [
                        "10xlarge",
                        1
                    ]
                ],
                "total_cost": "$3.594"
            },
            {
                "region": "us-west",
                "servers": [
                    [
                        "4xlarge",
                        1
                    ],
                    [
                        "10xlarge",
                        1
                    ]
                ],
                "total_cost": "$3.8600000000000003"
            }
        ];

        expect(result).to.eql(expected_result);
    });
});