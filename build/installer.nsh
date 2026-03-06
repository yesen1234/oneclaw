; OneClaw NSIS 自定义：安装前尝试删除当前用户的 .openclaw 目录，实现“全新安装”效果。
; 与 PowerShell 等价：Remove-Item -Recurse -Force "$env:USERPROFILE\.openclaw"
; 删除失败（如目录被占用、权限不足）不影响后续安装步骤，会清除错误标志继续安装。

!macro customInstall
  ClearErrors
  ReadEnvStr $0 USERPROFILE
  StrCmp $0 "" +3 0
  RMDir /r "$0\.openclaw"
  ClearErrors
!macroend
