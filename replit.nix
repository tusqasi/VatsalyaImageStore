{ pkgs }: {
	deps = [
  pkgs.openssh
  pkgs.htop
  pkgs.sudo
  pkgs.nodejs-18_x
  pkgs.nodePackages.typescript-language-server
  pkgs.yarn
  pkgs.replitPackages.jest
	];
}