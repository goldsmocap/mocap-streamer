{
  "targets": [
    {
      "target_name": "optitrackBridge",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [
        "<(module_root_dir)\\electron\\main\\producer\\optitrack\\cpp\\optitrackBridge.cc"
      ],
      "libraries":[
        "<(module_root_dir)\\NatNetLib.lib"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "<(module_root_dir)\\electron\\main\\producer\\optitrack\\cpp\\include"
      ],
      'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
    }
  ]
}
