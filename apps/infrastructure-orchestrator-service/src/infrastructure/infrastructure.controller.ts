import { Controller, Get, Post } from '@nestjs/common';

@Controller('api/infrastructure')
export class InfrastructureController {
  @Get('status')
  getStatus() {
    return {
      service: 'infrastructure-orchestrator-service',
      status: 'ok',
      stacks: {
        analytics: {
          status: 'unknown',
          services: ['redpanda', 'clickhouse'],
        },
        monitoring: {
          status: 'unknown',
          services: ['prometheus', 'grafana', 'alertmanager'],
        },
      },
    };
  }

  @Post('restart')
  restart() {
    return { message: 'Restart initiated' };
  }

  @Get('health')
  getHealth() {
    return { healthy: true, stacks: {} };
  }

  @Get('links')
  getLinks() {
    return {
      clickhouse: 'http://localhost:8123',
      redpanda: 'http://localhost:9092',
      grafana: 'http://localhost:3000',
      prometheus: 'http://localhost:9090',
      alertmanager: 'http://localhost:9093',
    };
  }
}
