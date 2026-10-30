# Experimental Raspberry Pi 4 Command Center

This profile targets 64-bit Raspberry Pi 4 systems running Debian or Raspberry
Pi OS with Docker Compose v2. It is intentionally limited to the Command Center,
MySQL, Redis, and a later Kiwix installation.

It does not install Ollama, Qdrant, Dozzle, the updater, or the disk collector.
Do not select AI or bulk content downloads during Easy Setup. Start with one
small local ZIM file and measure memory, swap, temperature, and storage I/O.

Install from an ARM-enabled fork and branch:

```bash
curl -fsSL \
  https://raw.githubusercontent.com/OWNER/project-nomad/BRANCH/install/install_nomad.sh \
  -o install_nomad.sh

sudo env \
  NOMAD_EXPERIMENTAL_ARM64=1 \
  NOMAD_REPOSITORY=OWNER/project-nomad \
  NOMAD_REF=BRANCH \
  bash install_nomad.sh
```

The installer stores `compose.pi4.yml` beside the normal compose file. The
manual update script automatically detects and reuses that overlay.

ARM64 images must exist for the Command Center tag before installation. This
profile does not make the current upstream AMD64-only image runnable on ARM.
By default, the installer pulls `ghcr.io/OWNER/project-nomad:latest`; set
`NOMAD_IMAGE` to a different fully qualified image and tag when needed.
Make the fork's GHCR package public before installing, or authenticate Docker
to GHCR on the target first.
