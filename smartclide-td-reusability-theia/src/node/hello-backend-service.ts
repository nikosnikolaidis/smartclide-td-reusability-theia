/*******************************************************************************
 * Copyright (C) 2021-2022 University of Macedonia
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
import { injectable } from "inversify";
import { BackendService } from "../common/protocol";


@injectable()
export class BackendServiceImpl implements BackendService {
    
    getEnvironmentVariable(): Promise<string> {
        var response= "env SMARTCLIDE_BACKEND_URL: "+ process.env.SMARTCLIDE_BACKEND_URL;

        return new Promise<string>(resolve => resolve(response))
    }
    
}


