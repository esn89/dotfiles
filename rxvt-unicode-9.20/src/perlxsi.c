#include "EXTERN.h"
#include "perl.h"
#include "XSUB.h"

EXTERN_C void xs_init (pTHX);

EXTERN_C void boot_urxvt (pTHX_ CV* cv);
EXTERN_C void boot_DynaLoader (pTHX_ CV* cv);

EXTERN_C void
xs_init(pTHX)
{
    static const char file[] = __FILE__;
    dXSUB_SYS;
    PERL_UNUSED_CONTEXT;

    newXS("urxvt::bootstrap", boot_urxvt, file);
    /* DynaLoader is a special case */
    newXS("DynaLoader::boot_DynaLoader", boot_DynaLoader, file);
}
