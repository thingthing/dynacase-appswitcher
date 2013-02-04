export targetdir
export utildir
export localBuildRule

SUBDIR = $(filter-out Makefile, $(wildcard */))

include $(utildir)/PubRule
include $(localBuildRule)/localBuildRule

DISTFILES = $(SUBDIR) Makefile