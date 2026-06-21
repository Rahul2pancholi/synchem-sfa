import { SetMetadata } from '@nestjs/common';
import type { ActorType } from '@synchem-sfa/shared-types';

export const ACTOR_KEY = 'actor';
export const RequireActor = (actor: ActorType) => SetMetadata(ACTOR_KEY, actor);
