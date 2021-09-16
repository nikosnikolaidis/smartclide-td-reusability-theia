import { ContainerModule } from 'inversify';
import { SmartclideTdReusabilityTheiaWidget } from './smartclide-td-reusability-theia-widget';
import { SmartclideTdReusabilityTheiaContribution } from './smartclide-td-reusability-theia-contribution';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bindViewContribution(bind, SmartclideTdReusabilityTheiaContribution);
    bind(FrontendApplicationContribution).toService(SmartclideTdReusabilityTheiaContribution);
    bind(SmartclideTdReusabilityTheiaWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: SmartclideTdReusabilityTheiaWidget.ID,
        createWidget: () => ctx.container.get<SmartclideTdReusabilityTheiaWidget>(SmartclideTdReusabilityTheiaWidget)
    })).inSingletonScope();
});
