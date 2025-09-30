import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Project, Source } from "aws-cdk-lib/aws-codebuild";
import { Pipeline, Artifact } from "aws-cdk-lib/aws-codepipeline";
import { CodeCommitSourceAction, CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { Repository as ECRRepository} from "aws-cdk-lib/aws-ecr";
import { Code, Repository } from "aws-cdk-lib/aws-codecommit";
import { Construct } from "constructs";

export class BuildPipelineStack extends Stack {
  public readonly ecrRepo: ECRRepository

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const demoRepo = new Repository(this, "DemoRepo", {
      repositoryName: "demo-repo",
      description: "A Demo repository for Dockerization",
      code: Code.fromDirectory("./mod09-containers/demo-repo", 'main'),
    })
    this.ecrRepo = new ECRRepository(this, "DemoECRRepo",{
      repositoryName: "demo-repo",
      removalPolicy: RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      imageScanOnPush: true
    })

    const demoBuild =  new Project(this, "DemoBuild", {
      source: Source.codeCommit({
        repository: demoRepo,
        branchOrRef: 'main'
      }),
      projectName: "demo-build",
      environment: {
        environmentVariables: {
          REPOSITORY_URI: {value: this.ecrRepo.repositoryUri},
          AWS_DEFAULT_REGION: {value: this.region}
        }
      }
    })
    
    demoRepo.grantPull(demoBuild)
    demoRepo.grantRead(demoBuild)
    this.ecrRepo.grantPush(demoBuild)
    this.ecrRepo.grantRead(demoBuild)

    const pipeline = new Pipeline(this, "DemoPipeline", {
      pipelineName: "demo-pipeline",
    })
    const buildArtifact = new Artifact("BuildArtifact")
    const sourceArtifact = new Artifact('SourceArtifact')
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new CodeCommitSourceAction({
          actionName: "codecommit-source",
          repository: demoRepo,
          branch: 'main',
          output: sourceArtifact
        })
      ]
    })

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({
          actionName: "demo-build",
          project: demoBuild,
          input: sourceArtifact,
          outputs: [buildArtifact]
        })
      ]
    })
  }
}